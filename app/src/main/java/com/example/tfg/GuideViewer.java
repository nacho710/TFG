package com.example.tfg;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.viewpager.widget.ViewPager;

public class GuideViewer extends AppCompatActivity {

    // creating object of ViewPager
    ViewPager mViewPager;

    // images array
    int[] images = {R.drawable.how_much_water_es, R.drawable.plant_and_animal_based_protein_es, R.drawable.source_of_vitamin_d_es, R.drawable.portion_of_fruit_and_veg_es,
            R.drawable.swaps_to_reduce_saturated_fats_es, R.drawable.what_is_a_portion_of_es, R.drawable.tips_for_shopping_during_covid19_es};

    // Creating Object of ViewPagerAdapter
    ViewPagerAdapter mViewPagerAdapter;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.guide_viewer);

        // Initializing the ViewPager Object
        mViewPager = (ViewPager)findViewById(R.id.viewPagerMain);

//         Initializing the ViewPagerAdapter
        mViewPagerAdapter = new ViewPagerAdapter(GuideViewer.this, images);

        // Adding the Adapter to the ViewPager
        mViewPager.setAdapter(mViewPagerAdapter);
    }
}
