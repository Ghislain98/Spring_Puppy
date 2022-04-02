create table puppy (puppy_id bigint not null auto_increment, puppy_birth_date datetime, puppy_gender varchar(255), puppy_image varchar(255), puppy_name varchar(255), primary key (puppy_id)) engine=InnoDB;
create table puppy_race (puppy_id bigint not null, race_id bigint not null) engine=InnoDB;
create table race (race_id bigint not null auto_increment, race_name varchar(255) not null, primary key (race_id)) engine=InnoDB;
alter table puppy_race add constraint FKlpd61xi97xdl56d3oawh8mnu3 foreign key (race_id) references race (race_id);
alter table puppy_race add constraint FKa043pm9w2nyy87qyg1b7wpu1t foreign key (puppy_id) references puppy (puppy_id);
