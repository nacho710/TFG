package com.example.tfg;

import android.app.ProgressDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
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

public class FirstLogin extends AppCompatActivity {

    FirebaseAuth mAuth;
    DatabaseReference mydb;
    private ProgressDialog progressDialog;


    private TUsuario usuario ;

    private EditText name;
    private EditText phone;
    private EditText edad;
    private EditText peso;
    private EditText altura;
    private String sexo;
    private String actividad;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.firstlogin);
        mAuth = FirebaseAuth.getInstance();
        progressDialog = new ProgressDialog(this);
        mydb = FirebaseDatabase.getInstance().getReference();

        name = (EditText) findViewById(R.id.editTextTextPersonName);
        phone = (EditText) findViewById(R.id.editTextPhone);
        edad = (EditText) findViewById(R.id.editTextNumber);
        peso = (EditText) findViewById(R.id.editTextNumberDecimal);
        altura = (EditText) findViewById(R.id.editTextNumberDecimal2);
        Spinner spinner = (Spinner) findViewById(R.id.spinner);
        spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {

            @Override
            public void onItemSelected(AdapterView<?> adapterView, View view, int position, long id)
            {
                Toast.makeText(adapterView.getContext(), (String) adapterView.getItemAtPosition(position), Toast.LENGTH_SHORT).show();
                sexo = (String) adapterView.getItemAtPosition(position);
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent)
            {
                // vacio

            }
        });
        Spinner spinner2 = (Spinner) findViewById(R.id.spinner2);
        spinner2.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {

            @Override
            public void onItemSelected(AdapterView<?> adapterView, View view, int position, long id)
            {
                Toast.makeText(adapterView.getContext(), (String) adapterView.getItemAtPosition(position), Toast.LENGTH_SHORT).show();
                actividad = (String) adapterView.getItemAtPosition(position);
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent)
            {
                // vacio

            }
        });

        usuario = new TUsuario();

    }
    public void botonConfirmar(View view){


        String nombree = name.getText().toString();
        String telefono =  phone.getText().toString();
        String edadd =  edad.getText().toString();
        String pesoo = peso.getText().toString();
        String alturaa =  altura.getText().toString();
        if(TextUtils.isEmpty(nombree) || TextUtils.isEmpty(telefono) || TextUtils.isEmpty(edadd)||TextUtils.isEmpty(pesoo) || TextUtils.isEmpty(alturaa)){
            Toast.makeText(FirstLogin.this,"Debe rellenar todos los campos antes de continuar",Toast.LENGTH_LONG).show();
        }
        else {

            String id = mAuth.getCurrentUser().getUid();
            mydb.child("Patient").child(id).addValueEventListener(new ValueEventListener() {
                @Override
                public void onDataChange(@NonNull DataSnapshot snapshot) {
                    if(snapshot.exists()){
//                        String nombre = snapshot.child("username").getValue().toString();
                            Map<String,Object> map = new HashMap<>();
                            map.put("username", nombree);
                            map.put("phone", telefono);
                            map.put("age", edadd);
                            map.put("weight", pesoo);
                            map.put("height", alturaa);
                            map.put("sex", sexo);
                            map.put("activity", actividad);

                            //TYPE 1 = PACIENTE
                            // TYPE 2 = DIETISTA

                            mydb.child("Patient").child(id).updateChildren(map);
                        startActivity(new Intent(FirstLogin.this, ChooseDietist.class));
                        finish();


                    }
                }

                @Override
                public void onCancelled(@NonNull DatabaseError error) {

                }
            });

        }

    }


}
