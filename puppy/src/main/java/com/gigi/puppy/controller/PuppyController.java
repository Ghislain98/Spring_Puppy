package com.gigi.puppy.controller;


import com.gigi.puppy.model.Puppy;
import com.gigi.puppy.model.PuppyRace;
import com.gigi.puppy.model.Race;
import com.gigi.puppy.repository.PuppyRepository;
import com.gigi.puppy.service.PuppyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("api")
public class PuppyController {
    @Autowired
    PuppyService puppyService;

    @RequestMapping(value="/puppys", method=RequestMethod.POST)
    public Puppy createPuppy(@RequestBody PuppyRace puppyRace) {
        Puppy puppy = puppyService.createPuppy(puppyRace.getPuppy(), puppyRace.getRace());
        return puppy;
    }

    @RequestMapping(value="/puppys", method=RequestMethod.GET)
    public Iterable<Puppy> readPuppys() {
        return puppyService.getPuppy();
    }

    @RequestMapping(value="/puppys/{puppyId}", method=RequestMethod.PUT)
    public Puppy readPuppys(@PathVariable(value = "puppyId") Long id, @RequestBody Puppy puppyDetails) {
        return puppyService.updatePuppy(id, puppyDetails);
    }

    @RequestMapping(value="/puppys/{puppyId}", method= RequestMethod.DELETE)
    public void deletePuppys(@PathVariable(value = "puppyId") Long id) {
        puppyService.deletePuppy(id);
    }
}
