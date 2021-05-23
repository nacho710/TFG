package com.example.tfg.Integracion;

public class Utils {
    public static String dayParser(int day){
        switch (day){
            case 0: return "sunday";
            case 1: return "monday";
            case 2: return "tuesday";
            case 3: return "wednesday";
            case 4: return "thursday";
            case 5: return "friday";
            case 6: return "saturday";
            default: return null;
        }
    }
    public static String DaytoDia(String day){
        switch (day){
            case "sunday": return "Domingo";
            case "monday": return "Lunes";
            case "tuesday": return "Martes";
            case "wednesday": return "Miércoles";
            case "thursday": return "Jueves";
            case "friday": return "Viernes";
            case "saturday": return "Sábado";
            default: return null;
        }
    }
    public static Double rating(Long day){
        if(day ==0){
            return 0.0;
        }
        else if(day ==1){
            return 1.0;
        }
        else if(day ==2){
            return 2.0;
        }
        else if(day ==3){
            return 3.0;
        }
        else if(day ==4){
            return 4.0;
        }
        else if(day ==5){
            return 5.0;
        }
        else return Double.valueOf(day);

        }

}
