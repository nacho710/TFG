package com.example.tfg;

import android.app.ProgressDialog;
import android.content.Intent;
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
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

public class ResetPassword extends AppCompatActivity {
    FirebaseAuth mAuth;
    private ProgressDialog progressDialog;
    DatabaseReference mydb;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.reset_password);
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        progressDialog = new ProgressDialog(this);
    }


    public void sendReset(View view) {
        final EditText emailRegister = (EditText) findViewById(R.id.emailReset);
        String email = emailRegister.getText().toString();
        if(email.length()>0) {
            mAuth.sendPasswordResetEmail(email).addOnCompleteListener(new OnCompleteListener<Void>() {
                @Override
                public void onComplete(@NonNull Task<Void> task) {
                    if (task.isSuccessful())
                        Toast.makeText(ResetPassword.this, "Contraseña restablecida, revisa tu correo.", Toast.LENGTH_LONG).show();
                    else
                        Toast.makeText(ResetPassword.this, task.getException().getMessage(), Toast.LENGTH_LONG).show();
                }
            });
        }
        else  Toast.makeText(ResetPassword.this, "Debes introducir un email ", Toast.LENGTH_LONG).show();








    }
}
