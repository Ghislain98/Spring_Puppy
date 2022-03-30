package com.gigi.puppy.service;

import com.gigi.puppy.model.Puppy;
import com.gigi.puppy.repository.PuppyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PuppyService {
    @Autowired
    PuppyRepository puppyRepository;

    // CREATE
    public Puppy createPuppy(Puppy puppy) {
        return puppyRepository.save(puppy);
    }

    // READ
    public List<Puppy> getPuppy() {
        return puppyRepository.findAll();
    }

    // DELETE
    public void deletePuppy(Long puppyId) {
        puppyRepository.deleteById(puppyId);
    }

    // UPDATE
    public Puppy updatePuppy(Long puppyId, Puppy puppyDetails) {
        Puppy puppy = puppyRepository.findById(puppyId).get();
        puppy.setName(puppyDetails.getName());
        puppy.setBirthdate(puppyDetails.getBirthdate());
        puppy.setGender(puppyDetails.getGender());
        puppy.setImage(puppyDetails.getImage());
        puppy.setRaces(puppyDetails.getRaces());

        return puppyRepository.save(puppy);
    }
    
}
