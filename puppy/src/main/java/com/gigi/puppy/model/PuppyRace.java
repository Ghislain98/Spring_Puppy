package com.gigi.puppy.model;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

public class PuppyRace {
    private Puppy puppy = new Puppy();
    private Set<Race> race = new HashSet<Race>();

    public PuppyRace(String name, Date birthDate, String gender, Set<Race> race, String image) {
        this.puppy.setName(name);
        this.puppy.setBirthDate(birthDate);
        this.puppy.setGender(gender);
        this.puppy.setImage(image);
        this.race = race;
    }

    public Puppy getPuppy() {
        return puppy;
    }

    public void setPuppy(Puppy puppy) {
        this.puppy = puppy;
    }

    public Set<Race> getRace() {
        return race;
    }

    public void setRaces(Set<Race> race) {
        this.race = race;
    }
}
