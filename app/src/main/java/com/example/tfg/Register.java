package com.example.tfg;

import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

import java.util.HashMap;
import java.util.Map;


public class Register extends AppCompatActivity {
     FirebaseAuth mAuth;
    private ProgressDialog progressDialog;
     DatabaseReference mydb;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.register);
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        progressDialog = new ProgressDialog(this);
    }

    public void createUser(View view){
       /* final EditText userName = (EditText) findViewById(R.id.username);
        String name = userName.getText().toString();*/
        final EditText emailRegister = (EditText) findViewById(R.id.fieldEmail);
        String email = emailRegister.getText().toString();
        final EditText passText = (EditText) findViewById(R.id.fieldPassword);
        String pass = passText.getText().toString();

      /*  final EditText pass2Text = (EditText) findViewById(R.id.pass2Register);
        String pass2 = pass2Text.getText().toString();
        final EditText phoneText = (EditText) findViewById(R.id.phoneRegister);
        String phone = phoneText.getText().toString();
        final EditText dateText = (EditText) findViewById(R.id.dateRegister);
        String date = dateText.getText().toString();
        final EditText pesoText = (EditText) findViewById(R.id.pesoRegister);
        String peso = pesoText.getText().toString();
        final EditText altruaText = (EditText) findViewById(R.id.altruaRegister);
        String altura = altruaText.getText().toString();
        final Spinner dietasSpinner = (Spinner) findViewById(R.id.DietasSpinner);
        String dietas = dietasSpinner.getSelectedItem().toString();
*/
        System.out.println(email);
        System.out.println(mAuth);
        System.out.println(FirebaseAuth.getInstance());
        signUp(email,pass);
        Intent i =  new Intent(this,Login.class);
        startActivity(i);
    }




    private void signUp(String email, String password) {
        if(TextUtils.isEmpty(email)){
            Toast.makeText(this,"Se debe ingresar un email",Toast.LENGTH_LONG).show();
            return;
        }

        if(TextUtils.isEmpty(password)){
            Toast.makeText(this,"Falta ingresar la contraseña",Toast.LENGTH_LONG).show();
            return;
        }
        progressDialog.setMessage("Realizando registro en linea...");
        progressDialog.show();
        // [START sign_in_with_email]
        mAuth.createUserWithEmailAndPassword(email, password)
                .addOnCompleteListener(this, new OnCompleteListener<AuthResult>() {
                    @Override
                    public void onComplete(@NonNull Task<AuthResult> task) {
                        //checking if success
                        if(task.isSuccessful()){

                            Toast.makeText(Register.this,"Se ha registrado el usuario con el email: "+email,Toast.LENGTH_LONG).show();

                            Map<String,Object> map = new HashMap<>();
                            map.put ("email", email);
                            map.put("username", "");
                            map.put("phone", "");
                            map.put("age", 0);
                            map.put("weight", 0.0);
                            map.put("height", 0.0);
                            map.put("userType",1);

                            System.out.println(map);
                            System.out.println(mydb.getRef());
                            String id = mAuth.getCurrentUser().getUid();
                            mydb.child("Patient").child(id).setValue(map);
                            finish();

                        }else{

                            Toast.makeText(Register.this,"No se pudo registrar el usuario ",Toast.LENGTH_LONG).show();
                        }
                        progressDialog.dismiss();
                    }
                });

        // [END sign_in_with_email]
    }






}