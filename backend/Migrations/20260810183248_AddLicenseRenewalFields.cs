using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddLicenseRenewalFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Remarks",
                table: "LicenseRenewals",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "LicenseRenewals",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LicenseRenewals_UserId",
                table: "LicenseRenewals",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_LicenseRenewals_Users_UserId",
                table: "LicenseRenewals",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LicenseRenewals_Users_UserId",
                table: "LicenseRenewals");

            migrationBuilder.DropIndex(
                name: "IX_LicenseRenewals_UserId",
                table: "LicenseRenewals");

            migrationBuilder.DropColumn(
                name: "Remarks",
                table: "LicenseRenewals");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "LicenseRenewals");
        }
    }
}
