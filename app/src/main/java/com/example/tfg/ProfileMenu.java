package com.example.tfg;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

public class ProfileMenu extends AppCompatActivity {

    FirebaseAuth mAuth;
    DatabaseReference mydb;
    private TextView peso;
    private TextView imc;
    private TextView nombre;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.profile_menu);
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        peso = (TextView) findViewById(R.id.pesoView);
        imc = (TextView) findViewById(R.id.imcView);
        nombre = (TextView) findViewById(R.id.nombreView);
        getInfoUser();
    }
    private void getInfoUser(){
        String id = mAuth.getCurrentUser().getUid();
        mydb.child("Users").child(id).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if(snapshot.exists()) {
                    String pesoValue = snapshot.child("weight").getValue().toString();
                    String alturaValue = snapshot.child("height").getValue().toString();
                    String nameValue = snapshot.child("username").getValue().toString();

                    imc.setText(calculateIMC(pesoValue,alturaValue));
                    peso.setText(pesoValue);
                    nombre.setText(nameValue);
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });
    }
    public void goToRegister(View view){
        Intent i =  new Intent(this,Register.class);
        startActivity(i);
        finish();
    }
    public void goToUpdatePeso(View view){
        Intent intent = new Intent(ProfileMenu.this, UpdateWeight.class);
        startActivity(intent);

    }
    public void gotoUpdateUser(View view){
        Intent i =  new Intent(this,UpdateUser.class);
        startActivity(i);

    }

    public void cerrarSesion(View view){
        mAuth.signOut();
        Intent intent = new Intent(ProfileMenu.this, Login.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK |Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(intent);
        finish();
    }
    private String calculateIMC(String peso,String altura){

        System.out.println((Double.valueOf(altura) /100));
        Double imcValue = (Double.valueOf(peso) / ((Double.valueOf(altura) /100)*(Double.valueOf(altura)/100)));
        imcValue = Math.floor(imcValue * 100) / 100;
        return imcValue.toString();
    }


}
