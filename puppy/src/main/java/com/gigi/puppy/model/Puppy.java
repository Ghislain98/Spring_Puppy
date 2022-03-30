package com.gigi.puppy.model;

import javax.persistence.*;

import org.springframework.boot.autoconfigure.domain.EntityScan;

import java.util.ArrayList;
import java.util.Date;

@Entity
@Table(name = "puppy")
public class Puppy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "puppy_id")
    private long id;
    @Column(name = "puppy_name")
    private String name;
    @Column(name = "puppy_birthdate")
    private Date birthdate;
    @Column(name = "puppy_gender")
    private String gender;
    @Column(name = "puppy_image")
    private String image;
    @Column(name = "puppy_races")
    private ArrayList races;

    public Puppy() {
    }

    public Puppy(long id, String name, Date birthdate, String gender, String image, ArrayList races) {
        this.id = id;
        this.name = name;
        this.birthdate = birthdate;
        this.gender = gender;
        this.image = image;
        this.races = races;
    }

    /**
     * get field @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     @Column(name = "puppy_id")

      *
      * @return id @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     @Column(name = "puppy_id")

     */
    public long getId() {
        return this.id;
    }

    /**
     * set field @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     @Column(name = "puppy_id")

      *
      * @param id @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     @Column(name = "puppy_id")

     */
    public void setId(long id) {
        this.id = id;
    }

    /**
     * get field @Column(name = "puppy_name")
     *
     * @return name @Column(name = "puppy_name")

     */
    public String getName() {
        return this.name;
    }

    /**
     * set field @Column(name = "puppy_name")
     *
     * @param name @Column(name = "puppy_name")

     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * get field @Column(name = "puppy_birthdate")
     *
     * @return birthdate @Column(name = "puppy_birthdate")

     */
    public Date getBirthdate() {
        return this.birthdate;
    }

    /**
     * set field @Column(name = "puppy_birthdate")
     *
     * @param birthdate @Column(name = "puppy_birthdate")

     */
    public void setBirthdate(Date birthdate) {
        this.birthdate = birthdate;
    }

    /**
     * get field @Column(name = "puppy_gender")
     *
     * @return gender @Column(name = "puppy_gender")

     */
    public String getGender() {
        return this.gender;
    }

    /**
     * set field @Column(name = "puppy_gender")
     *
     * @param gender @Column(name = "puppy_gender")

     */
    public void setGender(String gender) {
        this.gender = gender;
    }

    /**
     * get field @Column(name = "puppy_image")
     *
     * @return image @Column(name = "puppy_image")

     */
    public String getImage() {
        return this.image;
    }

    /**
     * set field @Column(name = "puppy_image")
     *
     * @param image @Column(name = "puppy_image")

     */
    public void setImage(String image) {
        this.image = image;
    }

    /**
     * get field @Column(name = "puppy_races")
     *
     * @return races @Column(name = "puppy_races")

     */
    public ArrayList getRaces() {
        return this.races;
    }

    /**
     * set field @Column(name = "puppy_races")
     *
     * @param races @Column(name = "puppy_races")

     */
    public void setRaces(ArrayList races) {
        this.races = races;
    }
}
