using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RefactorEnrollmentToLicenseNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Hawkers_EnrollmentNo",
                table: "Hawkers");

            migrationBuilder.AddColumn<string>(
                name: "LicenseNumber",
                table: "Hawkers",
                type: "text",
                nullable: true);

            // Copy existing data from EnrollmentNo to LicenseNumber
            migrationBuilder.Sql("UPDATE \"Hawkers\" SET \"LicenseNumber\" = \"EnrollmentNo\";");

            // For any records where LicenseNumber is still null, generate a fallback
            migrationBuilder.Sql("UPDATE \"Hawkers\" SET \"LicenseNumber\" = 'TEMP-' || \"Id\" WHERE \"LicenseNumber\" IS NULL OR \"LicenseNumber\" = '';");

            migrationBuilder.AlterColumn<string>(
                name: "LicenseNumber",
                table: "Hawkers",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "EnrollmentNo",
                table: "Hawkers");

            migrationBuilder.CreateIndex(
                name: "IX_Hawkers_LicenseNumber",
                table: "Hawkers",
                column: "LicenseNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Hawkers_LicenseNumber",
                table: "Hawkers");

            migrationBuilder.AddColumn<string>(
                name: "EnrollmentNo",
                table: "Hawkers",
                type: "text",
                nullable: true);

            // Copy LicenseNumber back to EnrollmentNo
            migrationBuilder.Sql("UPDATE \"Hawkers\" SET \"EnrollmentNo\" = \"LicenseNumber\";");

            migrationBuilder.DropColumn(
                name: "LicenseNumber",
                table: "Hawkers");

            migrationBuilder.CreateIndex(
                name: "IX_Hawkers_EnrollmentNo",
                table: "Hawkers",
                column: "EnrollmentNo",
                unique: true);
        }
    }
}
