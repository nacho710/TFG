package com.example.tfg;

import android.Manifest;
import android.app.Activity;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.widget.CheckBox;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.example.tfg.Integracion.Utils;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.OnProgressListener;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.UploadTask;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class DietFollow  extends AppCompatActivity {
    private static final int CAMERA_REQUEST = 1888;
    private ImageView imageView ;
    private static final int MY_CAMERA_PERMISSION_CODE = 100;
    FirebaseStorage storage;
    StorageReference storageReference;
    FirebaseAuth mAuth;
    DatabaseReference mydb;
    private TextView comida1View;
    private TextView comida2View;
    private TextView comida3View;
    private TextView comida4View;
    private TextView comida5View;
    private TextView comentView;
    public ArrayList<Bitmap> imagenes = new ArrayList<>();
    private TextView descripcionView;
    private CheckBox comida1Check;
    private CheckBox comida2Check;
    private CheckBox comida3Check;
    private CheckBox comida4Check;
    private CheckBox comida5Check;
    private TextView dayIdView;
    private List<String> picsIDs = new ArrayList<String>();

    private Calendar currentTime;
    private  String dayID;
    private String id;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.diet_follow);

        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        currentTime = Calendar.getInstance();
        storage = FirebaseStorage.getInstance();
        storageReference = storage.getReference();
        comida1View = (TextView) findViewById(R.id.comidaPop1);
        comida2View = (TextView) findViewById(R.id.comidaPop2);
        comida3View = (TextView) findViewById(R.id.comidaPop3);
        comida4View = (TextView) findViewById(R.id.comidaPop4);
        comida5View = (TextView) findViewById(R.id.comidaPop5);
        comentView = (TextView) findViewById(R.id.comentarioIdPop);
        comida1Check = (CheckBox) findViewById(R.id.comida1CheckPop);
        comida2Check = (CheckBox) findViewById(R.id.comida2CheckPop);
        comida3Check = (CheckBox) findViewById(R.id.comida3CheckPop);
        comida4Check = (CheckBox) findViewById(R.id.comida4CheckPop);
        comida5Check = (CheckBox) findViewById(R.id.comida5CheckPop);

        descripcionView = (TextView) findViewById(R.id.descripcionViewPop);
        dayIdView = (TextView) findViewById(R.id.dayIdPop);
        dayID =(currentTime.get(Calendar.DATE) +"-"+ (currentTime.get(Calendar.MONTH)+1)+"-"+ currentTime.get(Calendar.YEAR));
        dayIdView.setText("Seguimiento del "+ dayID );
        id = mAuth.getCurrentUser().getUid();
        getInfoUser();


    }

    private void getInfoUser(){

        String id = mAuth.getCurrentUser().getUid();
        mydb.child("Patient").child(id).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if(snapshot.exists()) {
                    String dietId = snapshot.child("dietId").getValue().toString();
                    String dia =  Utils.dayParser(currentTime.getTime().getDay());
                    String day = Utils.DaytoDia(dia);
                    mydb.child("Diets").child(dietId).child(day).addValueEventListener(new ValueEventListener() {
                        @Override
                        public void onDataChange(@NonNull DataSnapshot snapshot) {

                            comida1View.setText(snapshot.child("foods").child("food1").getValue().toString());
                            comida2View.setText( snapshot.child("foods").child("food2").getValue().toString());
                            comida3View.setText(snapshot.child("foods").child("food3").getValue().toString());
                            comida4View.setText(snapshot.child("foods").child("food4").getValue().toString());
                            comida5View.setText( snapshot.child("foods").child("food5").getValue().toString());
                            comentView.setText( snapshot.child("coment").getValue().toString());

                        }

                        @Override
                        public void onCancelled(@NonNull DatabaseError error) {

                        }
                    });

                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });


    }
    public void gotoUpload(View view){
        if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED)
        {
            requestPermissions(new String[]{Manifest.permission.CAMERA}, MY_CAMERA_PERMISSION_CODE);
        }
        else
        {
            Intent cameraIntent = new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
            startActivityForResult(cameraIntent, CAMERA_REQUEST);
        }
    }
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults)
    {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == MY_CAMERA_PERMISSION_CODE)
        {
            if (grantResults[0] == PackageManager.PERMISSION_GRANTED)
            {
                Toast.makeText(this, "camera permission granted", Toast.LENGTH_LONG).show();
                Intent cameraIntent = new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
                startActivityForResult(cameraIntent, CAMERA_REQUEST);
            }
            else
            {
                Toast.makeText(this, "camera permission denied", Toast.LENGTH_LONG).show();
            }
        }
    }
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {


        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == CAMERA_REQUEST && resultCode == Activity.RESULT_OK) {

            Bitmap photo = (Bitmap) data.getExtras().get("data");
            LinearLayout ll = (LinearLayout) findViewById(R.id.layoutFollowPhotos);
            imageView = new ImageView(DietFollow.this);

            imagenes.add(photo);
            imageView.setImageBitmap(photo);
            ll.addView(imageView);


        }
    }
    public  void uploadFollow(View view){
        AlertDialog.Builder  dialog = new AlertDialog.Builder(DietFollow.this);
        dialog.setTitle("¿La informacion es correcta?");
        dialog.setMessage("Si validas los datos no podras modificarlos mas adelante");
        dialog.setPositiveButton("Si, Validar datos", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {

                final boolean[] result = new boolean[1];


            List<String> a = new ArrayList<String>();
                a.add((String)comida1View.getText());
                a.add(String.valueOf(comida1Check.isChecked()));
            List<String> b = new ArrayList<String>();
                b.add((String)comida2View.getText());
                b.add(String.valueOf(comida2Check.isChecked()));
            List<String> c = new ArrayList<String>();
                c.add((String)comida3View.getText());
                c.add(String.valueOf(comida3Check.isChecked()));
            List<String> d = new ArrayList<String>();
                d.add((String)comida4View.getText());
                d.add(String.valueOf(comida4Check.isChecked()));
            List<String> e = new ArrayList<String>();
                e.add((String)comida5View.getText());
                e.add(String.valueOf(comida5Check.isChecked()));

//                        String nombre = snapshot.child("username").getValue().toString();

                            Map<String,Object> map = new HashMap<>();
                            map.put("food1", a);
                            map.put("food2",b);
                            map.put("food3",c);
                            map.put("food4", d);
                            map.put("food5", e);
                            map.put("descripcion", descripcionView.getText().toString());
                            map.put("coment",  comentView.getText().toString());
                            System.out.println("imagenes");
                            System.out.println(imagenes);
                            for(Bitmap bmp : imagenes) {
                                System.out.println(bmp);
                                String key = UUID.randomUUID().toString();
                                ByteArrayOutputStream stream = new ByteArrayOutputStream();
                                bmp.compress(Bitmap.CompressFormat.JPEG, 100, stream);
                                byte[] byteArray = stream.toByteArray();
                                StorageReference ref = storageReference.child(id + "/images/follow/" + dayID + "/" + key);
                                ref.putBytes(byteArray);
                                picsIDs.add(key);
                            }
                    map.put("photosIds",  picsIDs);
                final Handler handler = new Handler();
                handler.postDelayed(new Runnable() {
                    @Override
                    public void run() {   mydb.child("Patient").child(id).child("Follow").child(dayID).updateChildren(map); finish(); }} , 1000);

                    //mydb.child("Patient").child(id).child("Follow").child(dayID).updateChildren(map);



            }
        });
        dialog.setNegativeButton("No", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.dismiss();
            }
        });
        AlertDialog alertDialog = dialog.create();
        alertDialog.show();
    }
    public  void subirFoto(View view){
        Intent cameraIntent = new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
        startActivityForResult(cameraIntent, CAMERA_REQUEST);
    }




}

