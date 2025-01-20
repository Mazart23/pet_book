import { Metadata } from "next";
import QRCodeGenerator from "@/components/qr/QRCodeGenerator";

export const metadata: Metadata = {
  title: "QR Code Generator",
};

export default function QRPage() {
  return (
    <div>
      <QRCodeGenerator />
    </div>
  );
}