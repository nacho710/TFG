package com.example.tfg;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import java.util.HashMap;
import java.util.Map;

public class UpdateWeight extends AppCompatActivity {
    FirebaseAuth mAuth;
    DatabaseReference mydb;

    private EditText peso;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.update_weight);
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        peso = (EditText) findViewById(R.id.newWeightEditText);

    }
    public void actualizarPeso(View view){
        String pesoo = peso.getText().toString();
        if(!pesoo.equals("")) {
            String id = mAuth.getCurrentUser().getUid();
            Map<String, Object> map = new HashMap<>();
            map.put("weight", pesoo);
            mydb.child("Users").child(id).updateChildren(map).addOnCompleteListener(new OnCompleteListener<Void>() {
                @Override
                public void onComplete(@NonNull Task<Void> task) {
                    Intent intent = new Intent(UpdateWeight.this, ProfileMenu.class);
                    finish();
                }
            });
        }


        else{
            Toast.makeText(UpdateWeight.this,"Tienes que rellenar un peso",Toast.LENGTH_LONG).show();

        }
    }
}
