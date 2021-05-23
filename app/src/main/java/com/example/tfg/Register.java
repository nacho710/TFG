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
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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
        final EditText secondPassText = (EditText) findViewById(R.id.fieldPassword2);
        String pass2 = secondPassText.getText().toString();
        System.out.println(email);
        System.out.println(mAuth);
        System.out.println(FirebaseAuth.getInstance());
        if(verificarEmail(email,pass,pass2)){
            signUp(email,pass);
        }
    }

private boolean verificarEmail(String email,String pass,String pass2){
    String emailPattern = "[a-zA-Z0-9._-]+@[a-z]+\\.+[a-z]+";
    if(!email.matches(emailPattern)){
        Toast.makeText(this,"El formato de email es incorrecto",Toast.LENGTH_LONG).show();
        return false;
    }
    if(pass.length()<6) {
        Toast.makeText(this,"La contraseña tiene que tener mínimo 6 caracteres",Toast.LENGTH_LONG).show();
        return false;
    }
    if(!pass.equals(pass2)){
        Toast.makeText(this,"Las contraseñas no coinciden",Toast.LENGTH_LONG).show();
        return false;
    }
    return true;
}


    private void signUp(String email, String password) {
        if (TextUtils.isEmpty(email)) {
            Toast.makeText(this, "Se debe ingresar un email", Toast.LENGTH_LONG).show();
            return;
        }

        if (TextUtils.isEmpty(password)) {
            Toast.makeText(this, "Falta ingresar la contraseña", Toast.LENGTH_LONG).show();
            return;
        }
        progressDialog.setMessage("Realizando registro en linea...");
        progressDialog.show();

        try {
            mAuth.createUserWithEmailAndPassword(email, password).addOnSuccessListener(this, authResult -> {
                if (authResult.getUser() != null) {

                    Toast.makeText(Register.this, "Se ha registrado el usuario con el email: " + email, Toast.LENGTH_LONG).show();

                    Map<String, Object> map = new HashMap<>();
                    map.put("email", email);
                    map.put("username", "");
                    map.put("phone", "");
                    map.put("age", 0);
                    map.put("weight", 0.0);
                    map.put("height", 0.0);
                    String id = mAuth.getCurrentUser().getUid();
                    mydb.child("Patient").child(id).updateChildren(map);
                    finish();
                } else {

                    Toast.makeText(Register.this, "No se pudo registrar el usuario ", Toast.LENGTH_LONG).show();
                }
                progressDialog.dismiss();
            });
        } catch (Exception e) {
            Toast.makeText(Register.this, e.getMessage(), Toast.LENGTH_LONG).show();

            // [END sign_in_with_email]
        }

    }




}