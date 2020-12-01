package com.example.tfg;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.Spinner;

import androidx.appcompat.app.AppCompatActivity;

import java.sql.Date;


public class Register extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.register);

    }

    public void createUser(View view){
        /*final EditText userName = (EditText) findViewById(R.id.username);
        String name = userName.getText().toString();
        final EditText emailRegister = (EditText) findViewById(R.id.emailRegister);
        String email = emailRegister.getText().toString();
        final EditText passText = (EditText) findViewById(R.id.passRegister);
        String pass = passText.getText().toString();
        final EditText pass2Text = (EditText) findViewById(R.id.pass2Register);
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
        String dietas = dietasSpinner.getSelectedItem().toString();*/

        Intent i =  new Intent(this,ProfileMenu.class);
        startActivity(i);
    }
}