package com.example.tfg.Integracion;

public class Utils {
    public static String dayParser(int day){
        switch (day){
            case 0: return "sunday";
            case 1: return "monday";
            case 2: return "tuesday";
            case 3: return "wendesday";
            case 4: return "thursday";
            case 5: return "friday";
            case 6: return "saturday";
            default: return null;
        }
    }
}
