package com.example.tfg;

import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
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
    private TextView imcText;
    private TextView nombre;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.profile_menu);
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        peso = (TextView) findViewById(R.id.pesoView);
        imcText = (TextView) findViewById(R.id.imcTextView);
        imc = (TextView) findViewById(R.id.imcView);
        nombre = (TextView) findViewById(R.id.nombreView);
        getInfoUser();
    }
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.menu_main, menu);
        return true;
    }
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle item selection
        switch (item.getItemId()) {
            case R.id.action_settings:
                cerrarSesion();
                return true;
            case R.id.darseDeBaja:
                darseDeBaja();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }
    private void getInfoUser(){
        String id = mAuth.getCurrentUser().getUid();
        mydb.child("Patient").child(id).addValueEventListener(new ValueEventListener() {
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
    public  void darseDeBaja(){
        AlertDialog.Builder  dialog = new AlertDialog.Builder(ProfileMenu.this);
        dialog.setTitle("¿Estás seguro?");
        dialog.setMessage("Esta accion eliminara tu cuenta de usuario de nuesta base de datos y borrara todas tu informacion relacionada");
        dialog.setPositiveButton("Si,Darme de baja", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                String id = mAuth.getCurrentUser().getUid();
                mydb.child("Patient").child(id).addValueEventListener(new ValueEventListener() {
                    @Override
                    public void onDataChange(@NonNull DataSnapshot snapshot) {

                    }

                    @Override
                    public void onCancelled(@NonNull DatabaseError error) {

                    }
                });
                mAuth.getCurrentUser().delete().addOnCompleteListener(new OnCompleteListener<Void>() {
                    @Override
                    public void onComplete(@NonNull Task<Void> task) {
                        if(task.isSuccessful()){

                            Toast.makeText(ProfileMenu.this , "Cuenta eliminada", Toast.LENGTH_LONG).show();
                            Intent intent = new Intent(ProfileMenu.this, Login.class);
                            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK |Intent.FLAG_ACTIVITY_CLEAR_TOP);
                            startActivity(intent);
                            finish();
                        }
                        else  Toast.makeText(ProfileMenu.this , task.getException().getMessage(), Toast.LENGTH_LONG).show();
                    }
                });
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
    public void goToRegister(View view){
        Intent i =  new Intent(this,Register.class);
        startActivity(i);
        finish();
    }
    public void goToChooseDietician(View view){
        Intent i =  new Intent(this,ChooseDietist.class);
        startActivity(i);

    }
    public void goToUpdatePeso(View view){
        Intent intent = new Intent(ProfileMenu.this, UpdateWeight.class);
        startActivity(intent);

    }
    public void gotoUpdateUser(View view){
        Intent i =  new Intent(this,UpdateUser.class);
        startActivity(i);

    }
    private void cerrarSesion(){
        mAuth.signOut();
        Intent intent = new Intent(ProfileMenu.this, Login.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK |Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(intent);
        finish();
    }
//    public void cerrarSesion(View view){
//        mAuth.signOut();
//        Intent intent = new Intent(ProfileMenu.this, Login.class);
//        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK |Intent.FLAG_ACTIVITY_CLEAR_TOP);
//        startActivity(intent);
//        finish();
//    }
    private String calculateIMC(String peso,String altura){

        System.out.println((Double.valueOf(altura) /100));
        Double imcValue = (Double.valueOf(peso) / ((Double.valueOf(altura) /100)*(Double.valueOf(altura)/100)));
        imcValue = Math.floor(imcValue * 100) / 100;
        if(imcValue<18.5){
            imcText.setText("Peso insuficiente");
        } else  if(imcValue>=18.5 &&imcValue<24.9 ){
            imcText.setText("Normopeso");
        }else  if(imcValue>=25 &&imcValue<26.9 ){
            imcText.setText("Sobrepeso grado I");
        }
        else  if(imcValue>=27 &&imcValue<29.9 ){
            imcText.setText("Sobrepeso grado II (preobesidad)");
        }else  if(imcValue>=30 &&imcValue<34.9 ){
            imcText.setText("Obesidad de tipo I");
        }
        else  if(imcValue>=35 &&imcValue<39.9 ){
            imcText.setText("Obesidad de tipo II");
        }
        else  if(imcValue>=40 &&imcValue<49.9 ){
            imcText.setText("Obesidad de tipo III (mórbida)");
        }
        else  imcText.setText("Obesidad de tipo IV (extrema)");



        return imcValue.toString();
    }


}
