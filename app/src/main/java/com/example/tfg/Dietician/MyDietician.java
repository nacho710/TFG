package com.example.tfg.Dietician;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.text.SpannableString;
import android.text.style.UnderlineSpan;
import android.view.View;
import android.widget.Button;
import android.widget.RatingBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.example.tfg.R;
import com.example.tfg.User.UploadPhoto;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageReference;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class MyDietician extends AppCompatActivity {
    FirebaseStorage storage;
    StorageReference storageReference;
    FirebaseAuth mAuth;
    DatabaseReference mydb;

    private TextView nameView;
    private TextView phoneView;
    private TextView emailView;
    private TextView descriptionView;
    private ArrayList<String> lista;
    private Double suma;
    private String idDietista;
    private String sumaString;
    private RatingBar ratingBar;
    private String phone;
    private String email;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.dietician_profile);}
    @Override
    protected void onStart() {
        super.onStart();
        storage = FirebaseStorage.getInstance();
        storageReference = storage.getReference();
        mAuth = FirebaseAuth.getInstance();
        mydb = FirebaseDatabase.getInstance().getReference();
        nameView = findViewById(R.id.NameDietician);
        phoneView = findViewById(R.id.PhoneDietician);
        emailView = findViewById(R.id.EmailDietician);
        descriptionView = findViewById(R.id.DescripcionDietista);
        getInfoUser();
        Button getRating = findViewById(R.id.getRating);
        ratingBar = findViewById(R.id.ratingBar);
        String id = mAuth.getCurrentUser().getUid();

        mydb.child("Patient").child(id).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    if ((boolean) snapshot.child("dieticianValorated").getValue() == false) {
                        getRating.setEnabled(true);
                        ratingBar.setEnabled(true);
                        idDietista = snapshot.child("dieticianId").getValue().toString();

                    } else {
                        getRating.setEnabled(false);
                    }
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });

    }

    private void getInfoUser() {
        String id = mAuth.getCurrentUser().getUid();
        mydb.child("Patient").child(id).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    String idDietista = snapshot.child("dieticianId").getValue().toString();
                    mydb.child("Dietician").child(idDietista).addValueEventListener(new ValueEventListener() {
                        @Override
                        public void onDataChange(@NonNull DataSnapshot snapshot) {
                            if (snapshot.exists()) {


                                nameView.setText(snapshot.child("username").getValue().toString());
                                SpannableString content = new SpannableString(snapshot.child("email").getValue().toString());
                                content.setSpan(new UnderlineSpan(), 0, content.length(), 0);


                                emailView.setText(content);
                                email = snapshot.child("email").getValue().toString();
                                descriptionView.setText(snapshot.child("description").getValue().toString());
                                phone = snapshot.child("phone").getValue().toString();
                                phoneView.setText(snapshot.child("phone").getValue().toString());


                            }
                        }

                        @Override
                        public void onCancelled(@NonNull DatabaseError error) {

                        }


                    });

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

    public void sendEmail(View view) {
        Intent emailIntent = new Intent(Intent.ACTION_SENDTO);
        emailIntent.setData(Uri.parse("mailto:" + email));
        startActivity(emailIntent);

    }

    public void getRating(View view) {

        String id = mAuth.getCurrentUser().getUid();
        String rating = "Muchas gracias por enviar tu valoración";
        Toast.makeText(MyDietician.this, rating, Toast.LENGTH_LONG).show();
        mydb.child("Dietician").child(idDietista).child("worthList").addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    lista = (ArrayList<String>) (snapshot.getValue());
                    lista.add(String.valueOf(ratingBar.getRating()));
                    suma = 0.0;
                    for (String item : lista) {
                        if (item != "0.0")
                            suma += (Double.valueOf(item));
                    }
                    suma = suma / (lista.size());

                    sumaString = String.valueOf(Math.floor(suma * 100) / 100);
                    System.out.println(sumaString);
                    System.out.println(suma);
                    Map<String, Object> map = new HashMap<>();
                    map.put("worthList", lista);
                    map.put("worth", sumaString);
                    mydb.child("Dietician").child(idDietista).updateChildren(map);
                    Map<String, Object> map_user = new HashMap<>();
                    lista.add(String.valueOf(ratingBar.getRating()));
                    map_user.put("dieticianValorated", true);
                    mydb.child("Patient").child(id).updateChildren(map_user);
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });


    }

    public void openTelegram(View view) {
        Intent intent = getTelegramInt(this);
        startActivity(intent);

    }

    Intent getTelegramInt(Context context) {
        Intent intent;
        try {
            try { // check for telegram app
                context.getPackageManager().getPackageInfo("org.telegram.messenger", 0);
            } catch (PackageManager.NameNotFoundException e) {
                // check for telegram X app
                context.getPackageManager().getPackageInfo("org.thunderdog.challegram", 0);
            }
            // set app Uri
            intent = new Intent(Intent.ACTION_VIEW, Uri.parse("tg://resolve?domain=g438691580"));
        } catch (PackageManager.NameNotFoundException e) {
            // set browser URI
            intent = new Intent(Intent.ACTION_VIEW, Uri.parse("http://www.telegram.me/g438691580"));
        }
        return intent;
    }

    public void openWhatsApp(View view) {
        String url = "https://api.whatsapp.com/send?phone=34" + phone;
        Intent i = new Intent(Intent.ACTION_VIEW);
        i.setData(Uri.parse(url));
        startActivity(i);

    }
}

