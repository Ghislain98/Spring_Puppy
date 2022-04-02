package com.gigi.puppy.service;

import com.gigi.puppy.model.Puppy;
import com.gigi.puppy.model.Race;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Set;

public interface PuppyService {

    // CREATE
    @RequestMapping("/create")
    Puppy createPuppy(Puppy puppy, Set<Race> races);

    // READ
    Iterable<Puppy> getPuppy();

    // DELETE
    void deletePuppy(Long puppyId);

    // UPDATE
    Puppy updatePuppy(Long puppyId, Puppy puppyDetails);
}
