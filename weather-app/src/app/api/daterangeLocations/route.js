import connectMongoDB from '../../../utils/mongodb.js';
import { NextResponse } from "next/server";
import DaterangeLocation from '../../../models/DaterangeLocation.tsx';

export async function POST(req) {

    try {

        const { days, lat, lon, location, startDate, endDate } = await req.json();
        await connectMongoDB();

        await DaterangeLocation.create({ days, lat, lon, location, startDate, endDate })
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
        const daterangeLocations = await DaterangeLocation.find().sort({ createdAt: -1 });
        return NextResponse.json({ daterangeLocations }, { status: 200 })

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

        await DaterangeLocation.findOneAndUpdate(

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
        const id = req.nextUrl.searchParams.get('id');
        await DaterangeLocation.findByIdAndDelete(id);
        return NextResponse.json({ message: "Successfully deleted location" }, { status: 200 })

    }
    catch (error) {

        console.log(error);
        return NextResponse.json({ message: "Error fetching recent locations" }, { status: 500 });

    }

}