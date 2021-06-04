package com.example.tfg.User;

import android.app.ProgressDialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.text.TextUtils;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.example.tfg.R;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.OnProgressListener;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.UploadTask;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class UpdateUser extends AppCompatActivity {
    private final int PICK_IMAGE_REQUEST = 22;
    FirebaseStorage storage;
    StorageReference storageReference;
    FirebaseAuth mAuth;
    DatabaseReference mydb;
    private EditText name;
    private EditText phone;
    private EditText edad;
    private EditText altura;
    private Uri filePath;
    private ImageView image;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.update_user);}
    @Override
    protected void onStart() {
        super.onStart();
        mAuth = FirebaseAuth.getInstance();

        mydb = FirebaseDatabase.getInstance().getReference();
        storage = FirebaseStorage.getInstance();
        storageReference = storage.getReference();
        name = findViewById(R.id.editTextPersonUpdate);
        phone = findViewById(R.id.editTextPhoneUpdate);
        edad = findViewById(R.id.editTextNumberUpdate);
        altura = findViewById(R.id.editTextNumberDecimalUpdate);
        image = findViewById(R.id.imagenperfil);
        String id = mAuth.getCurrentUser().getUid();
        mydb.child("Patient").child(id).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if (snapshot.exists()) {
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

    public void botonConfirmarUpdate(View view) {


        String nombree = name.getText().toString();
        String telefono = phone.getText().toString();
        String edadd = edad.getText().toString();
        String alturaa = altura.getText().toString();
        if (TextUtils.isEmpty(nombree) || TextUtils.isEmpty(telefono) || TextUtils.isEmpty(edadd) || TextUtils.isEmpty(alturaa)) {
            Toast.makeText(UpdateUser.this, "Debe rellenar todos los campos antes de continuar", Toast.LENGTH_LONG).show();
        } else {

            String id = mAuth.getCurrentUser().getUid();

//                        String nombre = snapshot.child("username").getValue().toString();
            Map<String, Object> map = new HashMap<>();
            map.put("username", nombree);
            map.put("phone", telefono);
            map.put("age", edadd);
            map.put("height", alturaa);
            //TYPE 1 = PACIENTE
            // TYPE 2 = DIETISTA

            mydb.child("Patient").child(id).updateChildren(map);
            uploadImage();


        }


    }

    public void SelectImage(View view) {

        // Defining Implicit Intent to mobile gallery
        Intent intent = new Intent();

        intent.setType("image/*");
        intent.setAction(Intent.ACTION_GET_CONTENT);
        startActivityForResult(
                Intent.createChooser(
                        intent,
                        "Select Image from here..."),
                PICK_IMAGE_REQUEST);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_IMAGE_REQUEST && resultCode == RESULT_OK
                && data != null && data.getData() != null) {
            filePath = data.getData();
            try {

                System.out.println(" filePath");
                System.out.println(filePath);

                Bitmap bitmap = MediaStore.Images.Media.getBitmap(getContentResolver(), filePath);
                image.setImageBitmap(bitmap);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    // UploadImage method
    private void uploadImage() {

        if (filePath != null) {
            final ProgressDialog progressDialog = new ProgressDialog(this);
            progressDialog.setTitle("Uploading...");
            progressDialog.show();
            String id = mAuth.getCurrentUser().getUid();
            StorageReference ref = storageReference.child(id + "/images/profilepic");
            ref.putFile(filePath)
                    .addOnSuccessListener(new OnSuccessListener<UploadTask.TaskSnapshot>() {
                        @Override
                        public void onSuccess(UploadTask.TaskSnapshot taskSnapshot) {
                            progressDialog.dismiss();
                            Toast.makeText(UpdateUser.this, "Cambios realizados con éxito", Toast.LENGTH_LONG).show();
                            finish();
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            progressDialog.dismiss();
                            Toast.makeText(UpdateUser.this, "Failed " + e.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    })
                    .addOnProgressListener(new OnProgressListener<UploadTask.TaskSnapshot>() {
                        @Override
                        public void onProgress(UploadTask.TaskSnapshot taskSnapshot) {
                            double progress = (100.0 * taskSnapshot.getBytesTransferred() / taskSnapshot
                                    .getTotalByteCount());
                            progressDialog.setMessage("Uploaded " + (int) progress + "%");
                        }
                    });
        }
    }

}
