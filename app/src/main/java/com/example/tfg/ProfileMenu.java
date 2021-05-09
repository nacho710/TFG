package com.example.tfg;

import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.PopupWindow;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
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
import com.google.firebase.storage.StorageReference;

import java.util.Calendar;
import java.util.List;


public class ProfileMenu extends AppCompatActivity {
    FirebaseStorage storage;
    StorageReference storageReference;
    FirebaseAuth mAuth;
    DatabaseReference mydb;
    private TextView peso;
    private TextView imc;
    private TextView imcText;
    private TextView nombre;
    private ImageView imagen;
    private Button solicitarDietista;
    private Button midietabutton;
    private Button followdietaButton;
    private List<String> picIds;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        storage = FirebaseStorage.getInstance();
        storageReference = storage.getReference();
        setContentView(R.layout.profile_menu);
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        peso = (TextView) findViewById(R.id.pesoView);
        imcText = (TextView) findViewById(R.id.imcTextView);
        imc = (TextView) findViewById(R.id.imcView);
        nombre = (TextView) findViewById(R.id.nombreView);
        imagen =  (ImageView) findViewById(R.id.imagenPerfil);
        solicitarDietista = findViewById(R.id.solicitarDietistaButton);
        followdietaButton = findViewById(R.id.followDietaButton);
        midietabutton = findViewById(R.id.midietaButton);
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
            case R.id.misFotos:
                misFotos();
                return true;
            case R.id.AlarmSet:
                setAlarm();
                return true;
            case R.id.Refresh:
               refresh();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }
    private void getInfoUser(){
        String id = mAuth.getCurrentUser().getUid();
        mydb.child("Patient").child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if(snapshot.exists()) {
                    String pesoValue = snapshot.child("weight").getValue().toString();
                    String alturaValue = snapshot.child("height").getValue().toString();
                    String nameValue = snapshot.child("username").getValue().toString();
                    String idDietista = snapshot.child("dieticianId").getValue().toString();
                    if(!idDietista.equals("null")){
                        solicitarDietista.setEnabled(false);
                        followdietaButton.setEnabled(true);
                        midietabutton.setEnabled(true);
                    }
                    else   {solicitarDietista.setEnabled(true);
                        followdietaButton.setEnabled(false);
                        midietabutton.setEnabled(false);
                    }
                    imc.setText(calculateIMC(pesoValue,alturaValue));
                    peso.setText(pesoValue);
                    nombre.setText(nameValue);
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });


        final long ONE_MEGABYTE =  2048 * 2048;
        storageReference.child(id+"/images/profilepic").getBytes(ONE_MEGABYTE).addOnSuccessListener(new OnSuccessListener<byte[]>() {
            @Override
            public void onSuccess(byte[] bytes) {
                Bitmap bmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);

                imagen.setImageBitmap(bmp);


            }
        }).addOnFailureListener(new OnFailureListener() {
            @Override
            public void onFailure(@NonNull Exception exception) {
                imagen.setImageResource(R.drawable.fotoperfil);
            }
        });





    }
    public void refresh(){
        finish();
        overridePendingTransition(0, 0);
        startActivity(getIntent());
        overridePendingTransition(0, 0);
    }
    public  void darseDeBaja(){
        AlertDialog.Builder  dialog = new AlertDialog.Builder(ProfileMenu.this);
        dialog.setTitle("¿Estás seguro?");
        dialog.setMessage("Esta accion eliminara tu cuenta de usuario de nuesta base de datos y borrara todas tu informacion relacionada");
        dialog.setPositiveButton("Darme de baja", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                String id = mAuth.getCurrentUser().getUid();
                mydb.child("Patient").child(id).removeValue();
                storageReference.child(id).delete();
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
    public void gotoFollowList(View view) {
        Intent i = new Intent(this, FollowList.class);
        startActivity(i);
    }

    public void goToRegister(View view){
        Intent i =  new Intent(this,Register.class);
        startActivity(i);
        finish();
    }
    public void gotoGuide(View view){
        Intent i =  new Intent(this,GuideViewer.class);
        startActivity(i);

    }
    public void misFotos(){
        Intent i =  new Intent(this,MyPics.class);
        startActivity(i);

    }
    public void setAlarm(){
        Intent i =  new Intent(this,AlarmSet.class);
        startActivity(i);

    }
    public void gotoUpdateUser(View view){
        Intent i =  new Intent(this,UpdateUser.class);
        startActivity(i);

    }
    public void goToUpdatePeso(View view){
        Intent intent = new Intent(this, UpdateWeight.class);
        startActivity(intent);

    }
    public void goToChooseDietician(View view){

        String id = mAuth.getCurrentUser().getUid();
        mydb.child("Patient").child(id).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if(snapshot.exists()) {
                    String nameValue = snapshot.child("dieticianId").getValue().toString();
                    if(nameValue.equals("null")){
                        Intent i =  new Intent(ProfileMenu.this,ChooseDietist.class);
                        startActivity(i);
                    }
                    else Toast.makeText(ProfileMenu.this,"Ya tienes asignado un dietista, refresca la página", Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });

    }


public void gotoDietMenu(View view){
    Intent i =  new Intent(this,DietMenu.class);
    startActivity(i);
}
    public void openHelp(View view){
        LayoutInflater inflater = (LayoutInflater)
                getSystemService(LAYOUT_INFLATER_SERVICE);
        View popupView = inflater.inflate(R.layout.help_view, null);

        // create the popup window
        int width = LinearLayout.LayoutParams.MATCH_PARENT;
        int height = LinearLayout.LayoutParams.MATCH_PARENT;
        boolean focusable = true;
        final PopupWindow popupWindow = new PopupWindow(popupView, width, height, focusable);
        //     popupWindow.setAnimationStyle();

        // show the popup windowt
        // which view you pass in doesn't matter, it is only used for the window tolken
        popupWindow.showAtLocation(popupView, Gravity.BOTTOM, 0, 0);
        ImageView image =  popupWindow.getContentView().findViewById(R.id.helpImage);
        image.setImageResource(R.drawable.profilehelp);
        // dismiss the popup window when touched
        popupView.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                // popupWindow.dismiss();
                return true;
            }
        });

    }

    public void gotoDietFollow(View view){
        final int[] check = {0};
            String id = mAuth.getCurrentUser().getUid();
            final boolean[] result = new boolean[1];
            Intent i =  new Intent(this,DietFollow.class);
            Calendar currentTime = Calendar.getInstance();
            String dayID =(currentTime.get(Calendar.DATE) +"-"+ (currentTime.get(Calendar.MONTH)+1)+"-"+ currentTime.get(Calendar.YEAR));
            mydb.child("Patient").child(id).child("Follow").child(dayID).addValueEventListener(new ValueEventListener() {
                @Override
                public void onDataChange(@NonNull DataSnapshot snapshot) {
                    if(snapshot.exists()) {
                        if(check[0] ==0) {
                            Toast.makeText(ProfileMenu.this, "Seguimiento realizado anteriormente, revise sus seguimientos anteriores", Toast.LENGTH_LONG).show();

                        }
                    }
                    else { startActivity(i);
                        check[0] +=1;
                        }

                }

                @Override
                public void onCancelled(@NonNull DatabaseError error) {

                }
            });



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
