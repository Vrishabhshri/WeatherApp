import Image from 'next/image';

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

const isZipCode = (str: string) => /^\d{5}(-\d{4})?$/.test(str);
const isCoords = (str: string) => /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(str);

export { calcBackgroundColorFromCondition, calcIconFromCondition, isZipCode, isCoords };