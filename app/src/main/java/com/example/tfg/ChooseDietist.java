package com.example.tfg;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Spinner;
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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ChooseDietist extends AppCompatActivity {
    FirebaseAuth mAuth;
    DatabaseReference mydb;
    private Integer key;
    private Integer posMap;
    private TextView nombre;
    private TextView descripcion;
    private TextView valoracion;
    private HashMap<Integer,String> nameID_dietician;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        key=0;
        setContentView(R.layout.choose_dietist);
        List<String> listaNombres = new ArrayList<String>();
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        Spinner spinner = (Spinner) findViewById(R.id.spinnerDietician);
        String id = mAuth.getCurrentUser().getUid();
        nameID_dietician = new HashMap<Integer,String>();
        Integer i = 0;
        nombre = (TextView) findViewById(R.id.nombreDietician);
        valoracion  = (TextView) findViewById(R.id.valoracionDietician);
        descripcion = (TextView) findViewById(R.id.comentarioDietician);
        mydb.child("Dietician").addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if(snapshot.exists()) {
                    for ( DataSnapshot data : snapshot.getChildren()) {
                        listaNombres.add(data.child("username").getValue().toString());
                        nameID_dietician.put(key,data.getKey());
                        key++;
                    }
                    spinner.setAdapter(new ArrayAdapter<String>(getApplicationContext(), android.R.layout.simple_spinner_dropdown_item,listaNombres));
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });
        spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {

            @Override
            public void onItemSelected(AdapterView<?> adapterView, View view, int position, long id)
            {
                Toast.makeText(adapterView.getContext(), (String) adapterView.getItemAtPosition(position), Toast.LENGTH_SHORT).show();
                mydb.child("Dietician").child(nameID_dietician.get(position)).addValueEventListener(new ValueEventListener() {
                @Override
                public void onDataChange(@NonNull DataSnapshot snapshot) {
                    if(snapshot.exists()) {
                        if(snapshot.exists()) {
                            String nombreValue = snapshot.child("username").getValue().toString();
                            String worthValue = snapshot.child("worth").getValue().toString();
                            String descriptionValue = snapshot.child("description").getValue().toString();

                            nombre.setText(nombreValue);
                            valoracion.setText(worthValue);
                            descripcion.setText(descriptionValue);
                            posMap = position;
                        }
                    }
                }

                @Override
                public void onCancelled(@NonNull DatabaseError error) {

                }
            });
                //mydb.child("Dietician").child(nameID_dietician.get())
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent)
            {
                // vacio

            }
        });

    }

    public void confirmChooseDietician(View view){
        try {
            String id = mAuth.getCurrentUser().getUid();
            Map<String, Object> map = new HashMap<>();
            map.put("idPatient", id);
            map.put("idDietician", nameID_dietician.get(posMap));
            map.put("state", "0");

            DatabaseReference dba = FirebaseDatabase.getInstance().getReference().child("Request");
            dba.push().setValue(map);
//            mydb.child("Request").child(idRequest).addValueEventListener(new ValueEventListener() {
//                @Override
//                public void onDataChange(@NonNull DataSnapshot snapshot) {
//                    if(snapshot.exists()) {
//                        mydb.child("Request").child(idRequest).updateChildren(map);
//                    }
//                }
//
//                @Override
//                public void onCancelled(@NonNull DatabaseError error) {
//
//                }
//            });
//            finish();
        }
        catch(Exception e){
            System.out.println(e.getMessage());
        }
        }
}
