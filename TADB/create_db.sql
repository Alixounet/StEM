-- create_db.sql
-- StEM: Storyboard-Based Empirical
--       Modeling of Touch Interface
--       Performance
--
-- 2017-02-01
--
-- Code by: Alix Goguey, www.alixgoguey.fr
--
-- Project Authors: Alix Goguey, Gery Casiez, Andy Cockburn and Carl Gutwin
--                  http://ns.inria.fr/mjolnir/StEM
--
-- License: GNU General Public License v3.0
--   See https://github.com/Alixounet/StEM/blob/master/LICENSE
--

--
-- BD :  `fitts`
--

-- Clean-up
DROP TABLE IF EXISTS `fitts`.`Taps`;
DROP TABLE IF EXISTS `fitts`.`Pointings`;
DROP TABLE IF EXISTS `fitts`.`Drags`;
DROP TABLE IF EXISTS `fitts`.`Rotations`;
DROP TABLE IF EXISTS `fitts`.`Scalings`;
DROP TABLE IF EXISTS `fitts`.`Swipes`;
DROP TABLE IF EXISTS `fitts`.`Motivations`;
DROP TABLE IF EXISTS `fitts`.`Connexions`;
DROP TABLE IF EXISTS `fitts`.`Users`;
DROP TABLE IF EXISTS `fitts`.`CurrentUserID`;

-- Table `CurrentUserID`
CREATE TABLE `fitts`.`CurrentUserID` (
    `ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
INSERT INTO `fitts`.`CurrentUserID` (`ID`) VALUES (0);

-- Table `Users`
CREATE TABLE `fitts`.`Users` (
    `ID` int(11) NOT NULL,
    `Age` int(11) NOT NULL,
    `Handiness` enum('Right','Left') NOT NULL,
    `Gender` enum('Female','Male') NOT NULL,
    `Expertise` enum('Daily','Weekly','Rarely') NOT NULL,
    `ScreenWidth` int(11) NOT NULL,
    `ScreenHeight` int(11) NOT NULL,
    `Model` varchar(1000) NOT NULL,
    `DevicePixelRatio` FLOAT NOT NULL,
    `Eligibility` enum('Y','N') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
ALTER TABLE `fitts`.`Users` ADD PRIMARY KEY (`ID`);

-- Table `Connexions`
CREATE TABLE `fitts`.`Connexions` (
    `Socket` varchar(100) NOT NULL,
    `User` INT NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET=latin1;
ALTER TABLE `fitts`.`Connexions` ADD FOREIGN KEY (`User`) REFERENCES `fitts`.Users(`ID`);

-- Table `Motivations`
CREATE TABLE `fitts`.`Motivations` (
    `User` INT NOT NULL ,
    `NumberOfTasksPerformed` INT NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET=latin1;
ALTER TABLE `fitts`.`Motivations` ADD PRIMARY KEY (`User`);
ALTER TABLE `fitts`.`Motivations` ADD FOREIGN KEY (`User`) REFERENCES `fitts`.Users(`ID`);

-- Table `Taps`
CREATE TABLE `fitts`.`Taps` (
    `Date` DATETIME NOT NULL,
    `User` INT NOT NULL ,
    `Orientation` enum('Landscape','Portrait') NOT NULL,
    `Grip` enum('Unknown','Grip11','Grip21','Grip22') NOT NULL,
    `CenterX` FLOAT NOT NULL ,
    `CenterY` FLOAT NOT NULL ,
    `Radius` FLOAT NOT NULL ,
    `CompletionTime` INT NOT NULL ,
    `NumberOfTry` INT NOT NULL,
    `EndX` FLOAT NOT NULL,
    `EndY` FLOAT NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET=latin1;
ALTER TABLE `fitts`.`Taps` ADD PRIMARY KEY(`Date`,`User`);
ALTER TABLE `fitts`.`Taps` ADD FOREIGN KEY (`User`) REFERENCES `fitts`.Users(`ID`);

-- Table `Pointings`
CREATE TABLE `fitts`.`Pointings` (
    `Date` DATETIME NOT NULL,
    `User` INT NOT NULL ,
    `Orientation` enum('Landscape','Portrait') NOT NULL,
    `Grip` enum('Unknown','Grip11','Grip21','Grip22') NOT NULL,
    `StartCenterX` FLOAT NOT NULL ,
    `StartCenterY` FLOAT NOT NULL ,
    `StartRadius` FLOAT NOT NULL ,
    `EndCenterX` FLOAT NOT NULL ,
    `EndCenterY` FLOAT NOT NULL ,
    `EndRadius` FLOAT NOT NULL ,
    `CompletionTime` INT NOT NULL ,
    `NumberOfTry` INT NOT NULL,
    `CompletionTimeNoDrag` INT NOT NULL ,
    `NumberOfTryNoDrag` INT NOT NULL,
    `EndX` FLOAT NOT NULL,
    `EndY` FLOAT NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET=latin1;
ALTER TABLE `fitts`.`Pointings` ADD PRIMARY KEY(`Date`,`User`);
ALTER TABLE `fitts`.`Pointings` ADD FOREIGN KEY (`User`) REFERENCES `fitts`.Users(`ID`);

-- Table `Drags`
CREATE TABLE `fitts`.`Drags` (
    `Date` DATETIME NOT NULL,
    `User` INT NOT NULL ,
    `Orientation` enum('Landscape','Portrait') NOT NULL,
    `Grip` enum('Unknown','Grip11','Grip21','Grip22') NOT NULL,
    `StartCenterX` FLOAT NOT NULL ,
    `StartCenterY` FLOAT NOT NULL ,
    `StartRadius` FLOAT NOT NULL ,
    `EndCenterX` FLOAT NOT NULL ,
    `EndCenterY` FLOAT NOT NULL ,
    `EndRadius` FLOAT NOT NULL ,
    `CompletionTime` INT NOT NULL ,
    `NumberOfTry` INT NOT NULL,
    `EndX` FLOAT NOT NULL,
    `EndY` FLOAT NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET=latin1;
ALTER TABLE `fitts`.`Drags` ADD PRIMARY KEY(`Date`,`User`);
ALTER TABLE `fitts`.`Drags` ADD FOREIGN KEY (`User`) REFERENCES `fitts`.Users(`ID`);

-- Table `Rotations`
CREATE TABLE `fitts`.`Rotations` (
    `Date` DATETIME NOT NULL,
    `User` INT NOT NULL ,
    `Orientation` enum('Landscape','Portrait') NOT NULL,
    `Grip` enum('Unknown','Grip11','Grip21','Grip22') NOT NULL,
    `CenterX` FLOAT NOT NULL ,
    `CenterY` FLOAT NOT NULL ,
    `Radius` FLOAT NOT NULL ,
    `Angle` FLOAT NOT NULL ,
    `Aperture` FLOAT NOT NULL ,
    `CompletionTime` INT NOT NULL ,
    `NumberOfTry` INT NOT NULL,
    `EndAngle` FLOAT NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET=latin1;
ALTER TABLE `fitts`.`Rotations` ADD PRIMARY KEY(`Date`,`User`);
ALTER TABLE `fitts`.`Rotations` ADD FOREIGN KEY (`User`) REFERENCES `fitts`.Users(`ID`);

-- Table `Scalings`
CREATE TABLE `fitts`.`Scalings` (
    `Date` DATETIME NOT NULL,
    `User` INT NOT NULL ,
    `Orientation` enum('Landscape','Portrait') NOT NULL,
    `Grip` enum('Unknown','Grip11','Grip21','Grip22') NOT NULL,
    `CenterX` FLOAT NOT NULL ,
    `CenterY` FLOAT NOT NULL ,
    `StartRadius` FLOAT NOT NULL ,
    `TargetRadius` FLOAT NOT NULL ,
    `Thickness` FLOAT NOT NULL ,
    `CompletionTime` INT NOT NULL ,
    `NumberOfTry` INT NOT NULL,
    `EndRadius` FLOAT NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET=latin1;
ALTER TABLE `fitts`.`Scalings` ADD PRIMARY KEY(`Date`,`User`);
ALTER TABLE `fitts`.`Scalings` ADD FOREIGN KEY (`User`) REFERENCES `fitts`.Users(`ID`);

-- Table `Swipes`
CREATE TABLE `fitts`.`Swipes` (
    `Date` DATETIME NOT NULL,
    `User` INT NOT NULL ,
    `Orientation` enum('Landscape','Portrait') NOT NULL,
    `Grip` enum('Unknown','Grip11','Grip21','Grip22') NOT NULL,
    `StartCenterX` FLOAT NOT NULL ,
    `StartCenterY` FLOAT NOT NULL ,
    `Radius` FLOAT NOT NULL ,
    `EndCenterX` FLOAT NOT NULL ,
    `EndCenterY` FLOAT NOT NULL ,
    `CompletionTime` INT NOT NULL ,
    `CompletionMethod` enum('Speed','Distance') NOT NULL,
    `NumberOfTry` INT NOT NULL,
    `EndDistance` FLOAT NOT NULL,
    `EndSpeed` FLOAT NOT NULL,
    `EndX` FLOAT NOT NULL,
    `EndY` FLOAT NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET=latin1;
ALTER TABLE `fitts`.`Swipes` ADD PRIMARY KEY(`Date`,`User`);
ALTER TABLE `fitts`.`Swipes` ADD FOREIGN KEY (`User`) REFERENCES `fitts`.Users(`ID`);
