package com.gigi.puppy.repository;

import com.gigi.puppy.model.Race;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

public interface RaceRepository extends CrudRepository<Race, Long> {
}