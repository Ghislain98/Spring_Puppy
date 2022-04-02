package com.gigi.puppy.service;

import com.gigi.puppy.model.Puppy;
import com.gigi.puppy.model.Race;
import com.gigi.puppy.repository.PuppyRepository;
import com.gigi.puppy.repository.RaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Set;

@Service
public class PuppyServiceImpl implements PuppyService {
    @Autowired
    PuppyRepository puppyRepository;

    @Autowired
    RaceRepository raceRepository;

    // CREATE
    @Override
    @RequestMapping("/create")
    public Puppy createPuppy(Puppy puppy, Set<Race> races) {
        for (Race race: races) {
            raceRepository.save(race);
        }
        puppy.setRace(races);

        return puppyRepository.save(puppy);

    }

    // READ
    @Override
    public Iterable<Puppy> getPuppy() {
        return puppyRepository.findAll();
    }

    // DELETE
    @Override
    public void deletePuppy(Long puppyId) {
        puppyRepository.deleteById(puppyId);
    }

    // UPDATE
    @Override
    public Puppy updatePuppy(Long puppyId, Puppy puppyDetails) {
        Puppy puppy = puppyRepository.findById(puppyId).get();
        puppy.setName(puppyDetails.getName());
        puppy.setBirthDate(puppyDetails.getBirthDate());
        puppy.setGender(puppyDetails.getGender());
        puppy.setImage(puppyDetails.getImage());
        puppy.setRace(puppyDetails.getRace());

        return puppyRepository.save(puppy);
    }
    
}
