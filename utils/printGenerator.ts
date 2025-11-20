
import { CalendarEvent } from "../types";

export const printDaySchedule = (date: Date, events: CalendarEvent[]) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to print the schedule.");
    return;
  }

  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Sort events by time
  const sortedEvents = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const eventsHtml = sortedEvents.length > 0 
    ? sortedEvents.map(e => `
        <div class="event">
          <div class="time">
            ${new Date(e.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            <span class="end-time">- ${new Date(e.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div class="details">
            <div class="title">${e.title}</div>
            ${e.location ? `<div class="meta">📍 ${e.location}</div>` : ''}
            ${e.description ? `<div class="meta">📝 ${e.description}</div>` : ''}
          </div>
        </div>
      `).join('')
    : '<div class="no-events">No events scheduled for this day.</div>';

  // Embedded SVG Logo for Print
  const logoSvg = `
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 20 L80 20 L50 50 L20 20 Z M50 50 L80 80 L20 80 L50 50 Z" stroke="black" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="4" fill="black"/>
    </svg>
  `;

  const content = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Chronos Print - ${dateStr}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;800&display=swap');
          
          @page {
            size: A4 portrait;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
            width: 210mm;
            height: 296mm;
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            color: #000;
            background: #fff;
            display: flex;
            flex-direction: column;
          }

          .blank-half {
            height: 50%;
            width: 100%;
            border-bottom: 1px dashed #ccc;
            position: relative;
            box-sizing: border-box;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 10px;
          }

          .fold-instruction {
            font-size: 8pt;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 2px;
          }

          .content-half {
            height: 50%;
            padding: 20mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
          }

          header {
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .header-left {
            display: flex;
            flex-direction: column;
          }

          h1 {
            margin: 0;
            font-size: 18pt;
            text-transform: uppercase;
            letter-spacing: 1px;
            line-height: 1.2;
            font-weight: 800;
          }

          .date-sub {
            font-size: 9pt;
            margin-top: 4px;
            color: #444;
          }

          .brand-container {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .brand-text {
            font-size: 14pt;
            font-weight: 800;
            letter-spacing: 2px;
          }

          .events-container {
            flex-grow: 1;
            overflow: hidden; 
          }

          .event {
            display: flex;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #eee;
            page-break-inside: avoid;
          }

          .event:last-child {
            border-bottom: none;
          }

          .time {
            width: 100px;
            font-size: 9pt;
            font-weight: 600;
            flex-shrink: 0;
          }
          
          .end-time {
            display: block;
            font-size: 8pt;
            color: #666;
            font-weight: 400;
            margin-top: 2px;
          }

          .details {
            flex-grow: 1;
          }

          .title {
            font-size: 10pt;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .meta {
            font-size: 8pt;
            color: #555;
            margin-top: 2px;
          }

          .no-events {
            text-align: center;
            color: #999;
            margin-top: 50px;
            font-style: italic;
            font-size: 10pt;
          }

          footer {
            margin-top: auto;
            font-size: 8pt;
            text-align: center;
            color: #999;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="blank-half">
          <span class="fold-instruction">-- FOLD HERE --</span>
        </div>
        <div class="content-half">
          <header>
            <div class="header-left">
              <h1>${date.toLocaleDateString('en-US', { weekday: 'long' })}</h1>
              <div class="date-sub">${date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <div class="brand-container">
              ${logoSvg}
              <span class="brand-text">CHRONOS</span>
            </div>
          </header>

          <div class="events-container">
            ${eventsHtml}
          </div>

          <footer>
            Generated by Chronos App • Secure Local Storage
          </footer>
        </div>
        <script>
           window.onload = function() {
             setTimeout(function() {
                window.print();
             }, 500);
           }
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
};
