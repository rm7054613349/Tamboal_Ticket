import Ticket from "../../model/Ticket.js";
import User from "../../model/User.js";
import { generateTambulaTickets } from "../../helper/index.js";

export const createTicket = async (req, res) => {
  try {
    const { numberOfTicketSet, userId } = req.body;

    if (numberOfTicketSet <= 0) {
      return res
        .status(400)
        .json({ error: "Number of tickets should be greater than 0" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    for (let i = 0; i < numberOfTicketSet; i++) {
      // Generate tambula tickets
      const tickets = generateTambulaTickets();

      // Create tickets for each entry in the generated tickets
      for (const [ticketId, data] of Object.entries(tickets)) {
        const ticket = new Ticket({
          ticketData: data,
          user: user._id,
        });

        console.log(ticket.ticketData);

        // Save each ticket separately
        await ticket.save();
      }
    }

    res.status(201).json({ message: "Tickets created successfully" });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ error: "Failed to create tickets" });
  }
};

export const fetchTickets = async (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;

  try {
    // Get total count of tickets
    const totalCount = await Ticket.countDocuments({ user: userId });

    // Calculate pagination values
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    // Fetch ticket lists
    const tickets = await Ticket.find({ user: userId }).skip(skip).limit(limit);
    res.json({
      totalCount,
      totalPages,
      currentPage: page,
      tickets,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ error: "Internal Server Error" });
  }
};
