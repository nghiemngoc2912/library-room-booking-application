using Microsoft.EntityFrameworkCore;
using ServerSide.DTOs.Room;
using ServerSide.Models;
using ServerSide.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ServerSide.Services
{
    public class RoomService : IRoomService
    {
        private readonly IRoomRepository roomRepository;

        public RoomService(IRoomRepository roomRepository)
        {
            this.roomRepository = roomRepository;
        }

        public IEnumerable<HomeRoomDTO> GetAllRoomsForHome()
        {
            return roomRepository.GetAll().Select(r => new HomeRoomDTO(r)).ToList();
        }

        public IEnumerable<RoomLibrarian> GetAllRoomsForStaffManagement()
        {
            return roomRepository.GetAll().Select(r => new RoomLibrarian(r)).ToList();
        }

        CreateBookingRoomDTO IRoomService.GetRoomByIdForBooking(int id)
        {
            return new CreateBookingRoomDTO(roomRepository.GetById(id));
        }

        UpdateRoomDTO IRoomService.GetRoomByIdForUpdate(int id)
        {
            return new UpdateRoomDTO(roomRepository.GetById(id));
        }

        public bool UpdateRoom(UpdateRoomDTO updateRoomDTO)
        {
            if (updateRoomDTO == null)
            {
                throw new ArgumentNullException("DTO không hợp lệ.");
            }

            if (string.IsNullOrWhiteSpace(updateRoomDTO.RoomName))
            {
                throw new ArgumentException("Tên phòng không được để trống.");
            }

            if (updateRoomDTO.Capacity <= 0)
            {
                throw new ArgumentException("Sức chứa phải lớn hơn 0.");
            }

            // Validate Status as byte: allow 0, 1, 254 (-2), 255 (-1)
            if (!(updateRoomDTO.Status == 0 || updateRoomDTO.Status == 1 || updateRoomDTO.Status == 254 || updateRoomDTO.Status == 255))
            {
                throw new ArgumentException("Trạng thái không hợp lệ. Giá trị hợp lệ: -2 (Maintenance), -1 (Inactive), 0 (Pending), 1 (Active).");
            }

            var room = roomRepository.GetById(updateRoomDTO.Id);
            if (room == null)
            {
                return false;
            }

            room.RoomName = updateRoomDTO.RoomName;
            room.Capacity = updateRoomDTO.Capacity;
            room.Status = updateRoomDTO.Status; // No conversion needed, both are byte

            return roomRepository.Update(room);
        }

        public IEnumerable<RoomLibrarian> GetFilteredRoomsForLibrarian(string search = null, int? status = null)
        {
            var rooms = roomRepository.GetAll().AsQueryable();

            // Search by RoomName (case-insensitive, partial match)
            if (!string.IsNullOrWhiteSpace(search))
            {
                rooms = rooms.Where(r => r.RoomName.ToLower().Contains(search.ToLower()));
            }

            // Filter by Status (int values: -2, -1, 0, 1; null for all)
            if (status.HasValue)
            {
                byte statusByte = status.Value switch
                {
                    -2 => 254,
                    -1 => 255,
                    _ => (byte)status.Value
                };
                rooms = rooms.Where(r => r.Status == statusByte);
            }

            return rooms.Select(r => new RoomLibrarian(r)).ToList();
        }
    }

    public interface IRoomService
    {
        IEnumerable<HomeRoomDTO> GetAllRoomsForHome();
        IEnumerable<RoomLibrarian> GetAllRoomsForStaffManagement();
        CreateBookingRoomDTO GetRoomByIdForBooking(int id);
        UpdateRoomDTO GetRoomByIdForUpdate(int id);
        bool UpdateRoom(UpdateRoomDTO updateRoomDTO);
        IEnumerable<RoomLibrarian> GetFilteredRoomsForLibrarian(string search = null, int? status = null);
    }
}