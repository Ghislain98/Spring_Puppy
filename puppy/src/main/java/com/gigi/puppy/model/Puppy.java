package com.gigi.puppy.model;

import com.fasterxml.jackson.annotation.JsonFormat;

import javax.persistence.*;

import java.util.*;

@Entity
@Table(name = "puppy")
public class Puppy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "puppy_id")
    private Long id;
    @Column(name = "puppy_name")
    private String name;
    @Column(name = "puppy_birth_date")
    @JsonFormat
    private Date birthDate;
    @Column(name = "puppy_gender")
    private String gender;
    @Column(name = "puppy_image")
    private String image;

    @ManyToMany
    @JoinTable(name = "puppy_race",
            joinColumns = @JoinColumn(name = "puppy_id"),
            inverseJoinColumns = @JoinColumn(name = "race_id"))
    private Set<Race> race = new HashSet<>();

    public Puppy() {
    }

    public Puppy(long id, String name, Date birthDate, String gender, String image) {
        this.id = id;
        this.name = name;
        this.birthDate = birthDate;
        this.gender = gender;
        this.image = image;
    }

    public Puppy(long id, String name, Date birthDate, String gender, String image, Set<Race> race) {
        this.id = id;
        this.name = name;
        this.birthDate = birthDate;
        this.gender = gender;
        this.image = image;
        this.race = race;
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
    public Long getId() {
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
    public Date getBirthDate() {
        return this.birthDate;
    }

    /**
     * set field @Column(name = "puppy_birthdate")
     *
     * @param birthDate @Column(name = "puppy_birthdate")

     */
    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
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
     * @return race @Column(name = "puppy_races")
     */
    public Set<Race> getRace() {
        return this.race;
    }

    /**
     * set field @Column(name = "puppy_races")
     *
     * @param race @Column(name = "puppy_races")

     */
    public void setRace(Set<Race> race) {
        this.race = race;
    }
}
