import connectMongoDB from '../../utils/mongodb.js';
import { NextResponse } from "next/server";
import Location from '../../models/Location.tsx';

export async function POST(req) {

    try {

        const { city, country, lat, lon } = await req.json();
        await connectMongoDB();

        await Location.create({ city, country, lat, lon })
        return NextResponse.json({ message: "Location created" }, { status: 201 });

    }
    catch (error) {

        console.log(error);
        return NextResponse.json({ message: "Error creating location" }, { status: 500 });

    }

}

export async function GET() {

    try {

        await connectMongoDB();
        const locations = await Location.find().sort({ _id: -1 }).limit(10);
        return NextResponse.json({ locations })

    }
    catch (error) {

        console.log(error);
        return NextResponse.json({ message: "Error fetching recent locations" }, { status: 500 });

    }

}