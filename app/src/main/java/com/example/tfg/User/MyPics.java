package com.example.tfg.User;

import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
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
import com.google.firebase.storage.StorageReference;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MyPics extends AppCompatActivity implements View.OnLongClickListener {
    FirebaseStorage storage;
    StorageReference storageReference;
    FirebaseAuth mAuth;
    DatabaseReference mydb;
    private LinearLayout ll;
    private Integer numpic;
    private List<String> picIds;
    private String id;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.mypics);}
    @Override
    protected void onStart() {
        super.onStart();
        storage = FirebaseStorage.getInstance();
        storageReference = storage.getReference();
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();

        ll = findViewById(R.id.layoutfotos);
        ll.removeAllViews();
        id = mAuth.getCurrentUser().getUid();

        mydb.child("Patient").child(id).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    numpic = Integer.valueOf(snapshot.child("numpics").getValue().toString());
                    picIds = (List<String>) snapshot.child("picIds").getValue();
                    final long ONE_MEGABYTE = 2048 * 2048;
                    for (int i = 0; i < numpic; i++) {
                        ImageView imagen = new ImageView(MyPics.this);
                        imagen.setId(i);
//                        imagen.setOnTouchListener(new ImageMatrixTouchHandler(MyPics.this));
                        imagen.setOnLongClickListener(MyPics.this);
                        ll.addView(imagen);
                        storageReference.child(id + "/images/bodyimages/" + picIds.get(i)).getBytes(ONE_MEGABYTE).addOnSuccessListener(new OnSuccessListener<byte[]>() {
                            @Override
                            public void onSuccess(byte[] bytes) {
                                Bitmap bmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
                                imagen.setImageBitmap(bmp);
                            }
                        }).addOnFailureListener(new OnFailureListener() {
                            @Override
                            public void onFailure(@NonNull Exception exception) {
                                // Handle any errors
                            }
                        });
                    }
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });


    }

    public void gotoUpload(View view) {
        Intent i = new Intent(this, UploadPhoto.class);
        startActivity(i);
    }
//    @Override
//    public void onlongClick(View v) {
//
//    }


    @Override
    public boolean onLongClick(View v) {

        AlertDialog.Builder dialog = new AlertDialog.Builder(MyPics.this);
        dialog.setTitle("¿Desea eliminar la foto de nuestra base de datos?");
        dialog.setMessage("Esta acción eliminará tu imagen para siempre");
        dialog.setPositiveButton("SI", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                v.getId();
                mydb.child("Patient").child(id).child("picIds").addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(@NonNull DataSnapshot snapshot) {
                        if (snapshot.exists()) {
                            picIds = (List<String>) snapshot.getValue();
                            String value = snapshot.child(String.valueOf(v.getId())).getValue().toString();
                            Integer numPicsNw = numpic - 1;
                            if (numPicsNw != 0) {
                                picIds.remove(v.getId());
                                mydb.child("Patient").child(id).child("picIds").child(String.valueOf(v.getId())).removeValue();
                            }
                            Map<String, Object> map = new HashMap<>();
                            map.put("numpics", numPicsNw);
                            map.put("picIds", picIds);
                            mydb.child("Patient").child(id).updateChildren(map);
                            storageReference.child(id + "/images/bodyimages/" + value).delete();
                            finish();

                        }
                    }

                    @Override
                    public void onCancelled(@NonNull DatabaseError error) {

                    }
                });
            }
        });
        dialog.setNegativeButton("NO", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.dismiss();
            }
        });
        AlertDialog alertDialog = dialog.create();
        alertDialog.show();
        return false;
    }
}
