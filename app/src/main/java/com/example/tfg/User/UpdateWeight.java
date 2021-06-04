package com.example.tfg.User;

import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.tfg.R;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

import java.util.HashMap;
import java.util.Map;

public class UpdateWeight extends AppCompatActivity {
    FirebaseAuth mAuth;
    DatabaseReference mydb;
    private EditText peso;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.update_weight);}
    @Override
    protected void onStart() {
        super.onStart();
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        peso = findViewById(R.id.newWeightEditText);

    }
    public void actualizarPeso(View view) {
        Double pesoo = Double.valueOf(peso.getText().toString());
        if (!pesoo.equals("")) {
            String id = mAuth.getCurrentUser().getUid();
            Map<String, Object> map = new HashMap<>();
            map.put("weight", pesoo);
            mydb.child("Patient").child(id).updateChildren(map);

        } else {
            Toast.makeText(UpdateWeight.this, "Tienes que rellenar un peso", Toast.LENGTH_LONG).show();

        }

    }
}
