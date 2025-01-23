import Image from 'next/image';
import { jsPDF } from "jspdf";

const calcIconFromCondition = (condition: string) => {

    switch (condition) {

        case "Thunderstorm": return (

        <Image
        src="/icons/thunderstorm.svg"
        alt='Thunderstorm icon'
        width={24}
        height={24}
        >
        </Image>

        )
        case "Drizzle": return (

        <Image
        src="/icons/rain.svg"
        alt='Drizzle icon'
        width={24}
        height={24}
        >
        </Image>

        )
        case "Rain": return (

        <Image
        src="/icons/rain.svg"
        alt='Rain icon'
        width={24}
        height={24}
        >
        </Image>

        )
        case "Snow": return (

        <Image
        src="/icons/snow.svg"
        alt='Snow icon'
        width={24}
        height={24}
        >
        </Image>

        )
        case "Clear": return (

        <Image
        src="/icons/thunderstorm.svg"
        alt='Thunderstorm icon'
        width={24}
        height={24}
        >
        </Image>

        )
        case "Clouds": return (

        <Image
        src="/icons/clouds.svg"
        alt='Clouds icon'
        width={24}
        height={24}
        >
        </Image>

        )
        default: return (

        <Image
        src="/icons/default.svg"
        alt='Default icon'
        width={24}
        height={24}
        >
        </Image>

        )

    }

}

// Exporting as JSON
const exportJSON = (data) => {

    console.log(data);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "location-data.json";
    a.click();
    URL.revokeObjectURL(url);

}

// Exporting as PDF
const exportPDF = (data) => {

    const doc = new jsPDF();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Location Data", 10, 10);

    let offset = 20;
    for (const key in data) {

        doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${data[key]}`, 10, offset);
        offset += 10;

    }

    doc.save("location-data.pdf");

}

const isZipCode = (str: string) => /^\d{5}(-\d{4})?$/.test(str);
const isCoords = (str: string) => /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(str);

export { calcIconFromCondition, isZipCode, isCoords, exportJSON, exportPDF };