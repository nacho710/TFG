package com.example.tfg;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RatingBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;


import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageReference;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MyDietician extends AppCompatActivity {
    FirebaseStorage storage;
    StorageReference storageReference;
    FirebaseAuth mAuth;
    DatabaseReference mydb;

    private TextView nameView ;
    private TextView phoneView   ;
    private  TextView emailView   ;
    private TextView  descriptionView ;
    private  ArrayList<String> lista;
    private   Double suma;
    private String idDietista;
    private  String sumaString;
    private RatingBar ratingBar;
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.dietician_profile);
        storage = FirebaseStorage.getInstance();
        storageReference = storage.getReference();
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        nameView = (TextView) findViewById(R.id.NameDietician);
        phoneView=( TextView)  findViewById(R.id.PhoneDietician) ;
        emailView=( TextView)  findViewById(R.id.EmailDietician) ;
        descriptionView=( TextView)  findViewById(R.id.DescripcionDietista) ;
        getInfoUser();
        Button getRating = findViewById(R.id.getRating);
         ratingBar = findViewById(R.id.ratingBar);
        String id = mAuth.getCurrentUser().getUid();

        mydb.child("Patient").child(id).addValueEventListener(new ValueEventListener() {
                    @Override
                    public void onDataChange(@NonNull DataSnapshot snapshot) {
                        if(snapshot.exists()) {
                                if((boolean)snapshot.child("dieticianValorated").getValue()==false){
                                    getRating.setEnabled(true);
                                    ratingBar.setEnabled(true);
                                idDietista = snapshot.child("dieticianId").getValue().toString();
                                mydb.child("Dietician").child(idDietista).addValueEventListener(new ValueEventListener() {
                                    @Override
                                    public void onDataChange(@NonNull DataSnapshot snapshot) {
                                        if(snapshot.exists()) {


                                            lista = (ArrayList<String>)(snapshot.child("worthList").getValue());
                                            suma=0.0;
                                            for(String item : lista){
                                                if(item!="0")

                                                suma += Double.parseDouble(item);

                                            }

                                            suma = suma / (lista.size()+1);
                                            sumaString = String.valueOf(suma);


                                        }
                                    }

                                    @Override
                                    public void onCancelled(@NonNull DatabaseError error) {

                                    }


                                    });
                                }
                                else {
                                    getRating.setEnabled(false);
                                }
                        }
                    }

                    @Override
                    public void onCancelled(@NonNull DatabaseError error) {

                    }
                });

            }

    private void getInfoUser(){
        String id = mAuth.getCurrentUser().getUid();     
        mydb.child("Patient").child(id).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if(snapshot.exists()) {
                    String idDietista = snapshot.child("dieticianId").getValue().toString();
                    mydb.child("Dietician").child(idDietista).addValueEventListener(new ValueEventListener() {
                        @Override
                        public void onDataChange(@NonNull DataSnapshot snapshot) {
                            if(snapshot.exists()) {


                                nameView.setText(snapshot.child("username").getValue().toString());
                                emailView.setText(snapshot.child("email").getValue().toString());
                                descriptionView.setText(snapshot.child("description").getValue().toString());
                                phoneView.setText(snapshot.child("phone").getValue().toString());

                            }
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
    };
    public void gotoUpload(View view){
        Intent i =  new Intent(this,UploadPhoto.class);
        startActivity(i);
    }
    public void getRating(View view) {

        String id = mAuth.getCurrentUser().getUid();

        String rating = "Muchas gracias por enviar tu valoración";
                Toast.makeText(MyDietician.this, rating, Toast.LENGTH_LONG).show();
                Map<String,Object> map = new HashMap<>();
                lista.add(String.valueOf( ratingBar.getRating()));
                map.put("worthList", lista);

                map.put("worth",sumaString);

                mydb.child("Dietician").child(idDietista).updateChildren(map);
            Map<String,Object> map_user = new HashMap<>();
            lista.add(String.valueOf( ratingBar.getRating()));
            map_user.put("dieticianValorated", true);
        mydb.child("Patient").child(id).updateChildren(map_user);


    }
}

