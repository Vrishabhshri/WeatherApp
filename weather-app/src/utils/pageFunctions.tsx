import Image from 'next/image';

const calcBackgroundColorFromCondition = (condition: string) => {

    switch (condition) {

        case "Thunderstorm": return "bg-gray-800";
        case "Drizzle": return "bg-gray-500";
        case "Rain": return "bg-gray-500";
        case "Snow": return "bg-gray-500";
        case "Atmospheric": return "bg-blue-400";
        case "Clear": return "bg-blue-500";
        case "Clouds": return "bg-gray-500";
        default: return "bg-white"

    }

}

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

export { calcBackgroundColorFromCondition, calcIconFromCondition };