package com.example.tfg;

import android.content.Intent;
import android.graphics.drawable.ColorDrawable;
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

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

public class PopUpFollow extends AppCompatActivity {
    FirebaseStorage storage;
    StorageReference storageReference;
    FirebaseAuth mAuth;
    DatabaseReference mydb;
    private TextView peso;
    private TextView imc;
    private TextView imcText;
    private TextView nombre;
    private LinearLayout ll;
    private ImageView image1;
    private int[] imageArray;
    private int currentIndex;
    private int startIndex;
    private int endIndex;
    private Integer numpic;
    private List<String> picIds;
    private TextView comida1View       ;
    private TextView  comida2View      ;
    private TextView  comida3View      ;
    private TextView comida4View       ;
    private TextView comida5View       ;




    private CheckBox     comida1Check;
    private CheckBox     comida2Check;
    private CheckBox     comida3Check;
    private CheckBox     comida4Check;
    private CheckBox     comida5Check;
    private TextView dayIdView;
    private String id ;
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.popup_follow);
        storage = FirebaseStorage.getInstance();
        storageReference = storage.getReference();
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        Intent myIntent = getIntent();
        String value = myIntent.getStringExtra("date");

        comida1View = (TextView) findViewById(R.id.comida1);
        comida2View = (TextView) findViewById(R.id.comida2);
        comida3View = (TextView) findViewById(R.id.comida3);
         comida4View = (TextView) findViewById(R.id.comida4);
         comida5View = (TextView) findViewById(R.id.comida5);

        comida1Check = (CheckBox) findViewById(R.id.comida1Check);
        comida2Check = (CheckBox) findViewById(R.id.comida2Check);
        comida3Check = (CheckBox) findViewById(R.id.comida3Check);
        comida4Check = (CheckBox) findViewById(R.id.comida4Check);
        comida5Check = (CheckBox) findViewById(R.id.comida5Check);
        mydb.child("Patient").child(id).child("Follow").child(value).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshots) {
                if(snapshots.exists()) {

                    String valor = snapshots.child("food1").child("0").getValue().toString();
                    comida1View.setText(valor);
                    comida1Check.setChecked((Boolean)snapshots.child("food1").child("1").getValue());
                    comida2View.setText((String)snapshots.child(value).child("food2").child("0").getValue());
                    comida2Check.setChecked((Boolean)snapshots.child(value).child("food2").child("1").getValue());
                    comida3View.setText((String)snapshots.child(value).child("food3").child("0").getValue());
                    comida3Check.setChecked((Boolean)snapshots.child(value).child("food3").child("1").getValue());
                    comida4View.setText((String)snapshots.child(value).child("food4").child("0").getValue());
                    comida4Check.setChecked((Boolean)snapshots.child(value).child("food4").child("1").getValue());
                    comida5View.setText((String)snapshots.child(value).child("food5").child("0").getValue());
                    comida5Check.setChecked((Boolean)snapshots.child("Follow").child(value).child("food5").child("1").getValue());

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
    public void gotoUpload(View view){
        Intent i =  new Intent(this,UploadPhoto.class);
        startActivity(i);
    }

}
