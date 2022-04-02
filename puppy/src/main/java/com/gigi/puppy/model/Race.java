package com.gigi.puppy.model;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "race")
public class Race {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "race_id", nullable = false)
    private Long id;
    @Column(name = "race_name", nullable = false)
    private String name;

    public Race(){

    }

    public Race(Long id, String name, Set<Puppy> puppy) {
        this.id = id;
        this.name = name;
    }

    public Race(String name, Set<Puppy> puppy) {
        this.name = name;
    }

    public Race(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Race(String name) {
        this.id = id;
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}