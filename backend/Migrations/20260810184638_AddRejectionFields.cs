using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddRejectionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RejectedById",
                table: "Licenses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RejectedDate",
                table: "Licenses",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "Licenses",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "RejectedById",
                table: "Hawkers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RejectedDate",
                table: "Hawkers",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "Hawkers",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Remarks",
                table: "Hawkers",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Hawkers",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Licenses_RejectedById",
                table: "Licenses",
                column: "RejectedById");

            migrationBuilder.CreateIndex(
                name: "IX_Hawkers_RejectedById",
                table: "Hawkers",
                column: "RejectedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Hawkers_Users_RejectedById",
                table: "Hawkers",
                column: "RejectedById",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Licenses_Users_RejectedById",
                table: "Licenses",
                column: "RejectedById",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Hawkers_Users_RejectedById",
                table: "Hawkers");

            migrationBuilder.DropForeignKey(
                name: "FK_Licenses_Users_RejectedById",
                table: "Licenses");

            migrationBuilder.DropIndex(
                name: "IX_Licenses_RejectedById",
                table: "Licenses");

            migrationBuilder.DropIndex(
                name: "IX_Hawkers_RejectedById",
                table: "Hawkers");

            migrationBuilder.DropColumn(
                name: "RejectedById",
                table: "Licenses");

            migrationBuilder.DropColumn(
                name: "RejectedDate",
                table: "Licenses");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "Licenses");

            migrationBuilder.DropColumn(
                name: "RejectedById",
                table: "Hawkers");

            migrationBuilder.DropColumn(
                name: "RejectedDate",
                table: "Hawkers");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "Hawkers");

            migrationBuilder.DropColumn(
                name: "Remarks",
                table: "Hawkers");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Hawkers");
        }
    }
}
