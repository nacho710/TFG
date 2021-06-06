package com.example.tfg.Diet;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.PopupWindow;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.bogdwellers.pinchtozoom.ImageMatrixTouchHandler;
import com.example.tfg.R;
import com.example.tfg.User.UploadPhoto;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
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

public class FollowList extends AppCompatActivity implements View.OnClickListener {
    FirebaseStorage storage;
    StorageReference storageReference;
    FirebaseAuth mAuth;
    DatabaseReference mydb;

    private LinearLayout ll;
    private LinearLayout llphotos;

    private List<String> picIds;
    private TextView comida1View;
    private TextView comida2View;
    private TextView comida3View;
    private TextView comida4View;
    private TextView comida5View;
    private TextView comentView;
    private TextView pesoText;
    private TextView descripcionView;
    private Calendar currentTime;
    private String dayID;
    private PopupWindow popupWindow;
    private CheckBox comida1Check;
    private CheckBox comida2Check;
    private CheckBox comida3Check;
    private CheckBox comida4Check;
    private CheckBox comida5Check;
    private TextView dayIdView;
    private String id;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.follow_list);}
    @Override
    protected void onStart() {
        super.onStart();
        storage = FirebaseStorage.getInstance();
        storageReference = storage.getReference();
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        ll = findViewById(R.id.followLayout);
        id = mAuth.getCurrentUser().getUid();
        comida1View = findViewById(R.id.comida1);
        comida2View = findViewById(R.id.comida2);
        comida3View = findViewById(R.id.comida3);
        comida4View = findViewById(R.id.comida4);
        comida5View = findViewById(R.id.comida5);
        currentTime = Calendar.getInstance();
        dayID = (currentTime.get(Calendar.DATE) + "-" + (currentTime.get(Calendar.MONTH) + 1) + "-" + currentTime.get(Calendar.YEAR));
        comida1Check = findViewById(R.id.comida1Check);
        comida2Check = findViewById(R.id.comida2Check);
        comida3Check = findViewById(R.id.comida3Check);
        comida4Check = findViewById(R.id.comida4Check);
        comida5Check = findViewById(R.id.comida5Check);


        mydb.child("Patient").child(id).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {

                if (snapshot.exists()) {

                    if (snapshot.child("Follow").exists()) {
                        HashMap<String, List<String>> mapa = (HashMap<String, List<String>>) snapshot.child("Follow").getValue();
                        ArrayList<String> lista = new ArrayList<>(mapa.keySet());

                        for (int i = 0; i < lista.size(); i++) {

                            Button botton = new Button(FollowList.this);
                            botton.setText(lista.get(i));
                            botton.setId(i);
                            botton.setOnClickListener(FollowList.this);
                            ll.addView(botton);
                        }
                    } else {
                        Toast.makeText(FollowList.this, "Todavia no has hecho seguimientos", Toast.LENGTH_LONG).show();
                    }
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });


    }

    public void onButtonShowPopupWindowClick(View view) {

        // inflate the layout of the popup window

    }

    public void gotoUpload(View view) {
        Intent i = new Intent(this, UploadPhoto.class);
        startActivity(i);
    }

    @Override
    public void onClick(View v) {


        mydb.child("Patient").child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {

                if (snapshot.exists()) {


                    HashMap<String, List<String>> mapa = (HashMap<String, List<String>>) snapshot.child("Follow").getValue();
                    ArrayList<String> lista = new ArrayList<>(mapa.keySet());

                    LayoutInflater inflater = (LayoutInflater)
                            getSystemService(LAYOUT_INFLATER_SERVICE);
                    View popupView = inflater.inflate(R.layout.popup_follow, null);
                    int ide = v.getId();
                    String value = lista.get(ide);
                    // create the popup window
                    int width = LinearLayout.LayoutParams.MATCH_PARENT;
                    int height = LinearLayout.LayoutParams.MATCH_PARENT;
                    boolean focusable = true;
                    popupWindow = new PopupWindow(popupView, width, height, focusable);
                    // lets taps outside the popup also dismiss it
                    comida1View = popupWindow.getContentView().findViewById(R.id.comida1);
                    comida2View = popupWindow.getContentView().findViewById(R.id.comida2);
                    comida3View = popupWindow.getContentView().findViewById(R.id.comida3);
                    comida4View = popupWindow.getContentView().findViewById(R.id.comida4);
                    comida5View = popupWindow.getContentView().findViewById(R.id.comida5);
                    pesoText = popupWindow.getContentView().findViewById(R.id.pesoFollow);
                    dayIdView = popupWindow.getContentView().findViewById(R.id.day);

                    comida1Check = popupWindow.getContentView().findViewById(R.id.comida1Check);
                    comida2Check = popupWindow.getContentView().findViewById(R.id.comida2Check);
                    comida3Check = popupWindow.getContentView().findViewById(R.id.comida3Check);
                    comida4Check = popupWindow.getContentView().findViewById(R.id.comida4Check);
                    comida5Check = popupWindow.getContentView().findViewById(R.id.comida5Check);

                    comentView = popupWindow.getContentView().findViewById(R.id.comentario);
                    descripcionView = popupWindow.getContentView().findViewById(R.id.descripcion);
                    String id = mAuth.getCurrentUser().getUid();


                    mydb.child("Patient").child(id).child("Follow").child(value).addValueEventListener(new ValueEventListener() {
                        @Override
                        public void onDataChange(@NonNull DataSnapshot snapshots) {
                            if (snapshots.exists()) {

                                String valor = snapshots.child("food1").child("0").getValue().toString();
                                System.out.println(valor);
                                comida1View.setText(valor);
                                comida1Check.setChecked(Boolean.valueOf(snapshots.child("food1").child("1").getValue().toString()));
                                comida2View.setText(snapshots.child("food2").child("0").getValue().toString());
                                comida2Check.setChecked(Boolean.valueOf(snapshots.child("food2").child("1").getValue().toString()));
                                comida3View.setText(snapshots.child("food3").child("0").getValue().toString());
                                comida3Check.setChecked(Boolean.valueOf(snapshots.child("food3").child("1").getValue().toString()));
                                comida4View.setText(snapshots.child("food4").child("0").getValue().toString());
                                comida4Check.setChecked(Boolean.valueOf(snapshots.child("food4").child("1").getValue().toString()));
                                comida5View.setText(snapshots.child("food5").child("0").getValue().toString());
                                comida5Check.setChecked(Boolean.valueOf(snapshots.child("food5").child("1").getValue().toString()));
                                pesoText.setText("Peso del día: " + snapshots.child("weight").getValue().toString());
                                comentView.setText((String) snapshots.child("coment").getValue());
                                descripcionView.setText((String) snapshots.child("descripcion").getValue());
                                dayIdView.setText(value);


                                picIds = (List<String>) snapshots.child("photosIds").getValue();
                                llphotos = popupWindow.getContentView().findViewById(R.id.listaPhotos);
                                final long ONE_MEGABYTE = 2048 * 2048;
                                for (int i = 0; i < picIds.size(); i++) {
                                    ImageView imagen = new ImageView(FollowList.this);

                                    storageReference.child(id + "/images/follow/" + value + "/" + picIds.get(i)).getBytes(ONE_MEGABYTE).addOnSuccessListener(new OnSuccessListener<byte[]>() {
                                        @Override
                                        public void onSuccess(byte[] bytes) {
                                            System.out.println("HOLA");
                                            Bitmap bmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
                                            imagen.setImageBitmap(bmp);
                                            imagen.setOnTouchListener(new ImageMatrixTouchHandler(popupView.getContext()));
//                                                        LinearLayout.LayoutParams param = new LinearLayout.LayoutParams(
//                                                                LinearLayout.LayoutParams.MATCH_PARENT,
//                                                                LinearLayout.LayoutParams.MATCH_PARENT,
//                                                                1.0f
//                                                        );
//                                                        imagen.setLayoutParams(param);
                                            llphotos.addView(imagen);
                                        }
                                    }).addOnFailureListener(new OnFailureListener() {
                                        @Override
                                        public void onFailure(@NonNull Exception exception) {
                                            // Handle any errors
                                        }
                                    });
                                }
                            }


                        }


                        @Override
                        public void onCancelled(@NonNull DatabaseError error) {

                        }
                    });


                    // show the popup windowt
                    // which view you pass in doesn't matter, it is only used for the window tolken
                    popupWindow.showAtLocation(v, Gravity.CENTER, 0, 0);


                    // dismiss the popup window when touched
                    popupView.setOnTouchListener(new View.OnTouchListener() {
                        @Override
                        public boolean onTouch(View v, MotionEvent event) {
                            popupWindow.dismiss();
                            return true;
                        }
                    });


                }
            }


            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });


    }

}
