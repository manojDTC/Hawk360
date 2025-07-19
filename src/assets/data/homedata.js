

const alertsFilter = {
    camera: [
        { id: "CAM1", name: "Camera 1" },
        { id: "CAM2", name: "Camera 2" },
    ],
    animal: [
        { id: "ANM1", name: "Tiger" },
        { id: "ANM2", name: "Elephant" },
        { id: "ANM3", name: "Deer" },
        { id: "ANM4", name: "Bear" },
    ],
    team: [
        { id: "TM1", name: "Team 1" },
        { id: "TM2", name: "Team 2" },
    ],
    member: [
        { id: "MB1", name: "Ranger 1" },
        { id: "MB2", name: "Ranger 2" },
    ],
    area: [
        { id: "AREA1", name: "Village" },
        { id: "AREA2", name: "North Zone" },
        { id: "AREA3", name: "Checkpost" },
        { id: "AREA4", name: "East Zone" },
        { id: "AREA5", name: "West River" },
    ],
};

const animals = [
    {
        id: "1",
        animal: "ANM2",
        folder: "4.jpg",
        color: "gray",
        area: "AREA1",
        camera: "CAM1",
        date: "12-03-2025 14:25:30", // Today
        member: "MB1",
        team: "TM1",
        alert: "Village Crossing",
    },
    {
        id: "2",
        animal: "ANM1",
        folder: "1.jpg",
        color: "orange",
        area: "AREA2",
        camera: "CAM2",
        date: "11-03-2025 10:15:15", // Yesterday
        member: "MB2",
        team: "TM1",
        alert: "Animal Spotted",
    },
    {
        id: "3",
        animal: "ANM3",
        folder: "3.jpg",
        color: "brown",
        area: "AREA4",
        camera: "CAM2",
        date: "09-03-2025 18:30:45", // Within one week
        member: "MB2",
        team: "TM1",
        alert: "Animal Spotted",
    },
    {
        id: "4",
        animal: "ANM4",
        folder: "5.jpg",
        color: "black",
        area: "AREA2",
        camera: "CAM1",
        date: "07-03-2025 07:55:00", // Within one week
        member: "MB1",
        team: "TM2",
        alert: "Animal Spotted",
    },
    {
        id: "5",
        animal: "ANM2",
        folder: "2.jpeg",
        color: "gray",
        area: "AREA3",
        camera: "CAM2",
        date: "06-03-2025 22:10:30", // Within one week
        member: "MB1",
        team: "TM1",
        alert: "Checkpost Crossing",
    },
    {
        id: "6",
        animal: "ANM2",
        folder: "6.jpg",
        color: "gray",
        area: "AREA5",
        camera: "CAM1",
        date: "12-02-2025 11:35:20", // Within one month
        member: "MB1",
        team: "TM1",
        alert: "Animal Spotted",
    },
];





export { animals, alertsFilter };
