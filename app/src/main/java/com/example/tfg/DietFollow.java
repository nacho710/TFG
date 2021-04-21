package com.example.tfg;

import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.CheckBox;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageReference;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DietFollow extends AppCompatActivity {
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

    private TextView descripcionView;
    private CheckBox comida1Check;
    private CheckBox comida2Check;
    private CheckBox comida3Check;
    private CheckBox comida4Check;
    private CheckBox comida5Check;
    private TextView dayIdView;


    private Calendar currentTime;
    private  String dayID;



    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.diet_follow);
        storage = FirebaseStorage.getInstance();
        storageReference = storage.getReference();
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        setContentView(R.layout.diet_follow);
        currentTime = Calendar.getInstance();

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

            getInfoUser();


    }

    private void getInfoUser(){

        String id = mAuth.getCurrentUser().getUid();
        mydb.child("Patient").child(id).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if(snapshot.exists()) {
                    String dietId = snapshot.child("dietId").getValue().toString();
                    String dia =  String.valueOf(currentTime.getTime().getDay());
                    mydb.child("Diets").child(dietId).child("0").addValueEventListener(new ValueEventListener() {
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
        Intent i =  new Intent(this,UploadPhoto.class);
        startActivity(i);
    }

    public  void uploadFollow(View view){
        AlertDialog.Builder  dialog = new AlertDialog.Builder(DietFollow.this);
        dialog.setTitle("¿La informacion es correcta?");
        dialog.setMessage("Si validas los datos no podras modificarlos mas adelante");
        dialog.setPositiveButton("Si, Validar datos", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                String id = mAuth.getCurrentUser().getUid();
                final boolean[] result = new boolean[1];

                 id = mAuth.getCurrentUser().getUid();
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

                            mydb.child("Patient").child(id).child("Follow").child(dayID).updateChildren(map);

                startActivity(new Intent(DietFollow.this, ProfileMenu.class));
                finish();
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

}

