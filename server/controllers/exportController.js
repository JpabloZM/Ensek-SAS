import ServiceModel from "../models/serviceRequestModel.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Parser } from "json2csv";

/**
 * Controller for handling exports of calendar data
 */

// Helper function to format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper function to format time for display
const formatTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Export calendar data as PDF
 * @param {*} req - Request object with date and technician IDs
 * @param {*} res - Response object
 */
const exportToPdf = async (req, res) => {
  try {
    const { date, techId } = req.query;
    const techIds = techId ? (Array.isArray(techId) ? techId : [techId]) : [];

    // Set the start and end of the requested date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Query for services on the specified date for the specified technicians
    const query = {
      dateAssigned: { $gte: startDate, $lte: endDate },
    };

    // Only filter by technicians if they were provided
    if (techIds && techIds.length > 0 && techIds[0]) {
      query.assignedTechnicians = { $in: techIds };
    }

    const services = await ServiceModel.find(query)
      .populate("client", "name email phone")
      .populate("assignedTechnicians", "name username")
      .lean();

    // Create a PDF document
    const doc = new PDFDocument();
    const fileName = `calendario_${date}.pdf`;
    const filePath = path.join(__dirname, "..", "temp", fileName);

    // Ensure the temp directory exists
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const tempDir = path.join(__dirname, "..", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Pipe the PDF to a file
    const fileStream = fs.createWriteStream(filePath);
    doc.pipe(fileStream);

    // Add title
    doc.fontSize(20).text(`Servicios Programados - ${formatDate(date)}`, {
      align: "center",
    });

    doc.moveDown(2);

    // Add services
    if (services.length === 0) {
      doc.fontSize(12).text("No hay servicios programados para esta fecha.", {
        align: "center",
      });
    } else {
      services.forEach((service, index) => {
        // Service header
        doc
          .fontSize(14)
          .fillColor("#004122")
          .text(
            `Servicio #${index + 1}: ${service.serviceName || "Sin nombre"}`,
            {
              underline: true,
            }
          );

        doc.moveDown(0.5);

        // Service details
        doc
          .fontSize(12)
          .fillColor("#000000")
          .text(`Cliente: ${service.client?.name || "N/A"}`)
          .text(
            `Contacto: ${service.client?.phone || "N/A"} / ${
              service.client?.email || "N/A"
            }`
          )
          .text(`Dirección: ${service.address || "N/A"}`)
          .text(
            `Hora: ${formatTime(
              service.scheduledStartTime || service.dateAssigned
            )} - ${formatTime(
              service.scheduledEndTime ||
                new Date(service.dateAssigned).setHours(
                  service.dateAssigned.getHours() + 2
                )
            )}`
          )
          .text(`Descripción: ${service.descripcion || "Sin descripción"}`)
          .text(
            `Técnicos: ${
              service.assignedTechnicians
                ?.map((tech) => tech.name || tech.username)
                .join(", ") || "Sin asignar"
            }`
          );

        doc.moveDown(1);

        // Add a separator line except for the last item
        if (index < services.length - 1) {
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

          doc.moveDown(1);
        }
      });
    }

    // Add footer with date and page number
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);

      // Footer line
      doc.moveTo(50, 700).lineTo(550, 700).stroke();

      // Footer text
      doc
        .fontSize(10)
        .text(
          `Generado el ${new Date().toLocaleDateString("es-CO")} - Página ${
            i + 1
          } de ${pageCount}`,
          50,
          710,
          { align: "center" }
        );
    }

    // Finalize the PDF
    doc.end();

    // Wait for the file to be fully written
    fileStream.on("finish", () => {
      // Send the file
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send({ message: "Error al enviar el archivo PDF." });
        }

        // Delete the temporary file after sending
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr)
            console.error("Error deleting temporary file:", unlinkErr);
        });
      });
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send({ message: "Error al generar el archivo PDF." });
  }
};

/**
 * Export calendar data as CSV
 * @param {*} req - Request object with date and technician IDs
 * @param {*} res - Response object
 */
const exportToCsv = async (req, res) => {
  try {
    const { date, techId } = req.query;
    const techIds = Array.isArray(techId) ? techId : [techId];

    // Set the start and end of the requested date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Query for services on the specified date for the specified technicians
    const query = {
      dateAssigned: { $gte: startDate, $lte: endDate },
    };

    // Only filter by technicians if they were provided
    if (techIds && techIds.length > 0 && techIds[0]) {
      query.assignedTechnicians = { $in: techIds };
    }

    const services = await ServiceModel.find(query)
      .populate("client", "name email phone")
      .populate("assignedTechnicians", "name username")
      .lean();

    // Transform data for CSV
    const csvData = services.map((service) => {
      return {
        Servicio: service.serviceName || "Sin nombre",
        Cliente: service.client?.name || "N/A",
        Teléfono: service.client?.phone || "N/A",
        Email: service.client?.email || "N/A",
        Dirección: service.address || "N/A",
        Fecha: formatDate(service.dateAssigned),
        "Hora Inicio": formatTime(
          service.scheduledStartTime || service.dateAssigned
        ),
        "Hora Fin": formatTime(
          service.scheduledEndTime ||
            new Date(service.dateAssigned).setHours(
              service.dateAssigned.getHours() + 2
            )
        ),
        Descripción: service.descripcion || "Sin descripción",
        Técnicos:
          service.assignedTechnicians
            ?.map((tech) => tech.name || tech.username)
            .join(", ") || "Sin asignar",
        Estado:
          service.status === "completed"
            ? "Completado"
            : service.status === "in_progress"
            ? "En progreso"
            : "Pendiente",
      };
    });

    // Generate CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(csvData);

    // Set response headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=calendario_${date}.csv`
    );

    // Send the CSV
    res.send(csv);
  } catch (error) {
    console.error("Error generating CSV:", error);
    res.status(500).send({ message: "Error al generar el archivo CSV." });
  }
};

// Get current file directory (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export { exportToPdf, exportToCsv };
