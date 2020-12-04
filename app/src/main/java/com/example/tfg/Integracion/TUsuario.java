package com.example.tfg.Integracion;

import java.sql.Date;

public class TUsuario {
    private String userName;
    private  String email;
    private String  password;
    private String phone;
    private Integer birthDate;
    private Double weight;
    private Double height;

    public TUsuario(String userName, String email, String password, String phone, Integer birthDate, Double weight, Double height) {
        this.userName = userName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.birthDate = birthDate;
        this.weight = weight;
        this.height = height;
    }
    public TUsuario() {
        this.userName = "";
        this.email = "";
        this.password = "";
        this.phone = "";
        this.birthDate = 0;
        this.weight = 0.0;
        this.height = 0.0;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(Integer birthDate) {
        this.birthDate = birthDate;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }
}