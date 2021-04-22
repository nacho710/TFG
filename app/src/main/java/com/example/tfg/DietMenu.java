package com.example.tfg;

import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.widget.CheckBox;
import android.widget.LinearLayout;
import android.widget.PopupWindow;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.example.tfg.Integracion.Utils;
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

    private Calendar currentTime;
    private  String dayID;



    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        storage = FirebaseStorage.getInstance();
        storageReference = storage.getReference();
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        setContentView(R.layout.my_diet);

        currentTime.getInstance();
    }


    public void dietista(View view){

    }
    public void seguimientos(View view){
        Intent i = new Intent(this, FollowList.class);
        startActivity(i);
    }

    public void gotoUpload(View view){
        Intent i =  new Intent(this,UploadPhoto.class);
        startActivity(i);
    }


    @Override
    public void onClick(View v) {
        int ide= v.getId();
        String value = String.valueOf(ide);
        String id = mAuth.getCurrentUser().getUid();

        mydb.child("Patient").child(id).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if(snapshot.exists()) {

                    final Handler handler = new Handler();
                    handler.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            LayoutInflater inflater = (LayoutInflater)
                            getSystemService(LAYOUT_INFLATER_SERVICE);
                        int width = LinearLayout.LayoutParams.MATCH_PARENT;
                        int height = LinearLayout.LayoutParams.MATCH_PARENT;
                        boolean focusable = true;


                        View popupView = inflater.inflate(R.layout.diet_detail, null);
                        final PopupWindow popupWindow = new PopupWindow(popupView, width, height, focusable);
                        String dietId = snapshot.child("dietId").getValue().toString();
    //                    String dia =  Utils.dayParser(currentTime.getTime().getDay());
                            comida1View = (TextView) popupWindow.getContentView().findViewById(R.id.dietItem);
                            comida2View = (TextView) popupWindow.getContentView().findViewById(R.id.dietItem2);
                            comida3View = (TextView) popupWindow.getContentView().findViewById(R.id.dietItem3);
                            comida4View = (TextView) popupWindow.getContentView().findViewById(R.id.dietItem4);
                            comida5View = (TextView) popupWindow.getContentView().findViewById(R.id.dietItem5);
                        mydb.child("Diets").child(dietId).child("0").addValueEventListener(new ValueEventListener() {
                            @Override
                            public void onDataChange(@NonNull DataSnapshot snapshot) {

                                comida1View.setText(snapshot.child("foods").child("food1").getValue().toString());
                                comida2View.setText( snapshot.child("foods").child("food2").getValue().toString());
                                comida3View.setText(snapshot.child("foods").child("food3").getValue().toString());
                                comida4View.setText(snapshot.child("foods").child("food4").getValue().toString());
                                comida5View.setText( snapshot.child("foods").child("food5").getValue().toString());
//                                comentView.setText( snapshot.child("coment").getValue().toString());

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
                    }, 100);

                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });
    }
}


