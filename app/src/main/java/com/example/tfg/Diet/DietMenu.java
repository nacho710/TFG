package com.example.tfg.Diet;

import android.content.Intent;
import android.os.Bundle;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.PopupWindow;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.example.tfg.Dietician.MyDietician;
import com.example.tfg.R;
import com.example.tfg.User.UploadPhoto;
import com.example.tfg.Utils.Utils;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageReference;

import java.util.Calendar;

public class DietMenu extends AppCompatActivity implements View.OnClickListener {
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
    private TextView titulo;
    private String dayID;
    private String idDiet;
    private Button lunes;
    private Button martes;
    private Button miercoles;
    private Button jueves;
    private Button viernes;
    private Button sabado;
    private Button domingo;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        storage = FirebaseStorage.getInstance();}
    @Override
    protected void onStart() {
        super.onStart();
        storageReference = storage.getReference();
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        setContentView(R.layout.my_diet);
        String id = mAuth.getCurrentUser().getUid();
        lunes = findViewById(R.id.monday);
        martes = findViewById(R.id.tuesday);
        miercoles = findViewById(R.id.wednesday);
        jueves = findViewById(R.id.thursday);
        viernes = findViewById(R.id.friday);
        sabado = findViewById(R.id.saturday);
        domingo = findViewById(R.id.sunday);
        mydb.child("Patient").child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    String pesoValue = snapshot.child("weight").getValue().toString();
                    String alturaValue = snapshot.child("height").getValue().toString();
                    String nameValue = snapshot.child("username").getValue().toString();
                    idDiet = snapshot.child("dietId").getValue().toString();
                    if (!idDiet.equals("null")) {

                        lunes.setEnabled(true);
                        martes.setEnabled(true);
                        miercoles.setEnabled(true);
                        jueves.setEnabled(true);
                        viernes.setEnabled(true);
                        sabado.setEnabled(true);
                        domingo.setEnabled(true);


                    } else {
                        lunes.setEnabled(false);
                        martes.setEnabled(false);
                        miercoles.setEnabled(false);
                        jueves.setEnabled(false);
                        viernes.setEnabled(false);
                        sabado.setEnabled(false);
                        domingo.setEnabled(false);

                    }

                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });

    }


    public void dietista(View view) {
        Intent i = new Intent(this, MyDietician.class);
        startActivity(i);
    }

    public void seguimientos(View view) {
        Intent i = new Intent(this, FollowList.class);
        startActivity(i);
    }

    public void gotoUpload(View view) {
        Intent i = new Intent(this, UploadPhoto.class);
        startActivity(i);
    }


    @Override
    public void onClick(View v) {
        int ide = v.getId();

        String value = getResources().getResourceEntryName(ide);
        System.out.println(value);
        String id = mAuth.getCurrentUser().getUid();

        mydb.child("Patient").child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if (snapshot.exists()) {


                    LayoutInflater inflater = (LayoutInflater)
                            getSystemService(LAYOUT_INFLATER_SERVICE);
                    int width = LinearLayout.LayoutParams.MATCH_PARENT;
                    int height = LinearLayout.LayoutParams.MATCH_PARENT;
                    boolean focusable = true;
                    View popupView = inflater.inflate(R.layout.diet_detail, null);
                    final PopupWindow popupWindow = new PopupWindow(popupView, width, height, focusable);
                    //     popupWindow.setAnimationStyle();
                    String dietId = snapshot.child("dietId").getValue().toString();

                    String dia = Utils.dayParser(Calendar.getInstance().getTime().getDay());
                    System.out.println("dia");
                    System.out.println(dia);
                    titulo = popupWindow.getContentView().findViewById(R.id.tituloDiet);
                    comida1View = popupWindow.getContentView().findViewById(R.id.dietItem);
                    comida2View = popupWindow.getContentView().findViewById(R.id.dietItem2);
                    comida3View = popupWindow.getContentView().findViewById(R.id.dietItem3);
                    comida4View = popupWindow.getContentView().findViewById(R.id.dietItem4);
                    comida5View = popupWindow.getContentView().findViewById(R.id.dietItem5);
                    comentView = popupWindow.getContentView().findViewById(R.id.ComentDietDay);
                    System.out.println(dia);

                    // CAMBIAR POR DIA
                    String day = Utils.DaytoDia(value);

                    mydb.child("Diets").child(dietId).child(day).addListenerForSingleValueEvent(new ValueEventListener() {
                        @Override
                        public void onDataChange(@NonNull DataSnapshot snapshot) {

                            comida1View.setText(snapshot.child("foods").child("food1").getValue().toString());
                            comida2View.setText(snapshot.child("foods").child("food2").getValue().toString());
                            comida3View.setText(snapshot.child("foods").child("food3").getValue().toString());
                            comida4View.setText(snapshot.child("foods").child("food4").getValue().toString());
                            comida5View.setText(snapshot.child("foods").child("food5").getValue().toString());
                            comentView.setText(snapshot.child("coment").getValue().toString());
                            if (Utils.DaytoDia(value) == "Sabado") {

                                titulo.setText("Sábado");

                            } else if (Utils.DaytoDia(value) == "Miercoles") {

                                titulo.setText("Miércoles");
                            } else titulo.setText(Utils.DaytoDia(value));
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
                            // popupWindow.dismiss();
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


