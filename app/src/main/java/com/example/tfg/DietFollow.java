package com.example.tfg;

import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.CheckBox;
import android.widget.ImageView;
import android.widget.LinearLayout;
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
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageReference;

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
        storage = FirebaseStorage.getInstance();
        storageReference = storage.getReference();
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        setContentView(R.layout.diet_follow);
        currentTime = Calendar.getInstance();

        comida1View = (TextView) findViewById(R.id.comida1);
        comida2View = (TextView) findViewById(R.id.comida2);
        comida3View = (TextView) findViewById(R.id.comida3);
        comida4View = (TextView) findViewById(R.id.comida4);
        comida5View = (TextView) findViewById(R.id.comida5);
        comentView = (TextView) findViewById(R.id.comentarioId);
        comida1Check = (CheckBox) findViewById(R.id.comida1Check);
        comida2Check = (CheckBox) findViewById(R.id.comida2Check);
        comida3Check = (CheckBox) findViewById(R.id.comida3Check);
        comida4Check = (CheckBox) findViewById(R.id.comida4Check);
        comida5Check = (CheckBox) findViewById(R.id.comida5Check);
        descripcionView = (TextView) findViewById(R.id.descripcionView);
        dayIdView = (TextView) findViewById(R.id.dayId);
        dayID =(currentTime.get(Calendar.DATE) +"-"+ (currentTime.get(Calendar.MONTH)+1)+"-"+ currentTime.get(Calendar.YEAR));
        dayIdView.setText("Seguimiento del "+ dayID );
        if(!realizado())
            getInfoUser();
        else  {Toast.makeText(DietFollow.this,"Seguimiento realizado anteriormente, revise sus seguimientos anteriores",Toast.LENGTH_LONG).show();}
    }
    private boolean realizado(){
        String id = mAuth.getCurrentUser().getUid();
        final boolean[] result = new boolean[1];
        mydb.child("Patient").child(id).child("Follow").child(dayID).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if(snapshot.exists()) {
                    result[0] = true;
                }
                else  result[0] = false;
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });
        System.out.println(result[0]);
        return result[0];
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

//                        String nombre = snapshot.child("username").getValue().toString();
                            Map<String,Object> map = new HashMap<>();
                            map.put("comida1", comida1Check.isChecked());
                            map.put("comida2", comida2Check.isChecked());
                            map.put("comida3", comida3Check.isChecked());
                            map.put("comida4", comida4Check.isChecked());
                            map.put("comida5", comida5Check.isChecked());
                            map.put("descripcion", descripcionView.getText().toString());

                            mydb.child("Patient").child(id).child("Follow").child(dayID).updateChildren(map);

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

