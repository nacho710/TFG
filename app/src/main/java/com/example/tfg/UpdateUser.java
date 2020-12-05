package com.example.tfg;

import android.app.ProgressDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.example.tfg.Integracion.TUsuario;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import java.util.HashMap;
import java.util.Map;

public class UpdateUser extends AppCompatActivity {

    FirebaseAuth mAuth;
    DatabaseReference mydb;
    private ProgressDialog progressDialog;


    private TUsuario usuario ;

    private EditText name;
    private EditText phone;
    private EditText edad;
    private EditText peso;
    private EditText altura;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.update_user);
        mAuth = FirebaseAuth.getInstance();
        progressDialog = new ProgressDialog(this);
        mydb = FirebaseDatabase.getInstance().getReference();

        name = (EditText) findViewById(R.id.editTextPersonUpdate);
        phone = (EditText) findViewById(R.id.editTextPhoneUpdate);
        edad = (EditText) findViewById(R.id.editTextNumberUpdate);
        altura = (EditText) findViewById(R.id.editTextNumberDecimalUpdate);

        String id = mAuth.getCurrentUser().getUid();
        mydb.child("Users").child(id).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if(snapshot.exists()) {
                    String edadValue = snapshot.child("age").getValue().toString();
                    String telefonoValue = snapshot.child("phone").getValue().toString();
                    String alturaValue = snapshot.child("height").getValue().toString();
                    String nameValue = snapshot.child("username").getValue().toString();

                    name.setText(nameValue);
                    phone.setText(telefonoValue);
                    edad.setText(edadValue);
                    altura.setText(alturaValue);
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });

    }
    public void botonConfirmarUpdate(View view){


        String nombree = name.getText().toString();
        String telefono =  phone.getText().toString();
        String edadd =  edad.getText().toString();
        String alturaa =  altura.getText().toString();
        if(TextUtils.isEmpty(nombree) || TextUtils.isEmpty(telefono) || TextUtils.isEmpty(edadd)|| TextUtils.isEmpty(alturaa)){
            Toast.makeText(UpdateUser.this,"Debe rellenar todos los campos antes de continuar",Toast.LENGTH_LONG).show();
        }
        else {

            String id = mAuth.getCurrentUser().getUid();

//                        String nombre = snapshot.child("username").getValue().toString();
            Map<String,Object> map = new HashMap<>();
            map.put("username", nombree);
            map.put("phone", telefono);
            map.put("age", edadd);
            map.put("height", alturaa);
            //TYPE 1 = PACIENTE
            // TYPE 2 = DIETISTA

            mydb.child("Users").child(id).updateChildren(map);
            startActivity(new Intent(UpdateUser.this, ProfileMenu.class));
            finish();



        }


}

}
