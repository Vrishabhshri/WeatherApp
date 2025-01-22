import connectMongoDB from '../../../utils/mongodb.js';
import { NextResponse } from "next/server";
import RecentLocation from '../../../models/RecentLocation.tsx';

export async function POST(req) {

    try {

        const { city, country, lat, lon } = await req.json();
        await connectMongoDB();

        await RecentLocation.create({ city, country, lat, lon })
        return NextResponse.json({ message: "Location created" }, { status: 200 });

    }
    catch (error) {

        console.log(error);
        return NextResponse.json({ message: "Error creating location" }, { status: 500 });

    }

}

export async function GET() {

    try {

        await connectMongoDB();
        const recentLocations = await RecentLocation.find().sort({ createdAt: -1 });
        return NextResponse.json({ recentLocations }, { status: 200 })

    }
    catch (error) {

        console.log(error);
        return NextResponse.json({ message: "Error fetching recent locations" }, { status: 500 });

    }

}

export async function PUT(req) {

    try {

        await connectMongoDB();

        const { lat, lon, updates } = await req.json();

        await RecentLocation.findOneAndUpdate(

            { lat, lon },
            { $set: updates },
            { new: true }

        );

        return NextResponse.json({ message: "Location updated successfully" }, { status: 200 })

    }
    catch (error) {

        console.log(error);
        return NextResponse.json({ message: "Error updating recent location" }, { status: 500 });

    }

}

export async function DELETE(req) {

    try {

        await connectMongoDB();

        const { id } = req.nextUrl.searchParams.get('id');

        

        return NextResponse.json({ recentLocations }, { status: 200 })

    }
    catch (error) {

        console.log(error);
        return NextResponse.json({ message: "Error fetching recent locations" }, { status: 500 });

    }

}