using Microsoft.EntityFrameworkCore;
using ServerSide.DTOs;
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

        public bool CreateRoom(CreateRoomDTO createRoomDTO)
        {
            if (createRoomDTO == null)
            {
                throw new ArgumentNullException("DTO không hợp lệ.");
            }

            if (string.IsNullOrWhiteSpace(createRoomDTO.RoomName))
            {
                throw new ArgumentException("Tên phòng không được để trống.");
            }

            if (createRoomDTO.Capacity <= 0)
            {
                throw new ArgumentException("Sức chứa phải lớn hơn 0.");
            }

            // Validate Status as byte: allow 0, 1, 254 (-2), 255 (-1)
            if (!(createRoomDTO.Status == 0 || createRoomDTO.Status == 1 || createRoomDTO.Status == 254 || createRoomDTO.Status == 255))
            {
                throw new ArgumentException("Trạng thái không hợp lệ. Giá trị hợp lệ: -2 (Maintenance), -1 (Inactive), 0 (Pending), 1 (Active).");
            }

            var room = new Room
            {
                RoomName = createRoomDTO.RoomName,
                Capacity = createRoomDTO.Capacity,
                Status = createRoomDTO.Status
            };

            return roomRepository.Create(room);
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
            room.Status = updateRoomDTO.Status;

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

        public bool ToggleMaintenance(int roomId)
        {
            var room = roomRepository.GetById(roomId);
            if (room == null)
            {
                return false;
            }

            // Toggle logic
            if (room.Status == 1)         // Active
            {
                room.Status = 254;        // Maintenance (-2)
            }
            else if (room.Status == 254)  // Maintenance (-2)
            {
                room.Status = 1;          // Active
            }
            else
            {
                throw new InvalidOperationException("Chỉ phòng đang hoạt động hoặc bảo trì mới được chuyển trạng thái.");
            }

            roomRepository.Update(room);
            roomRepository.Save();
            return true;
        }

        public IEnumerable<RoomRequestDTO> GetPendingRooms(string search = null)
        {
            var rooms = roomRepository.GetAll().Where(r => r.Status == 0).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                rooms = rooms.Where(r => r.RoomName != null && r.RoomName.ToLower().Contains(search.ToLower()));
            }

            return rooms.Select(r => new RoomRequestDTO(r)).ToList();
        }

        public RoomRequestDTO GetPendingRoomById(int id)
        {
            var room = roomRepository.GetById(id);
            if (room == null || room.Status != 0)
            {
                return null;
            }
            return new RoomRequestDTO(room);
        }

        public bool AcceptRoom(int id)
        {
            var room = roomRepository.GetById(id);
            if (room == null || room.Status != 0)
            {
                return false;
            }
            room.Status = 1; // Active
            return roomRepository.Update(room);
        }

        public bool RejectRoom(int id)
        {
            var room = roomRepository.GetById(id);
            if (room == null || room.Status != 0)
            {
                return false;
            }
            return roomRepository.Delete(id);
        }
    }

    public interface IRoomService
    {
        IEnumerable<HomeRoomDTO> GetAllRoomsForHome();
        IEnumerable<RoomLibrarian> GetAllRoomsForStaffManagement();
        CreateBookingRoomDTO GetRoomByIdForBooking(int id);
        UpdateRoomDTO GetRoomByIdForUpdate(int id);
        bool CreateRoom(CreateRoomDTO createRoomDTO);
        bool UpdateRoom(UpdateRoomDTO updateRoomDTO);
        IEnumerable<RoomLibrarian> GetFilteredRoomsForLibrarian(string search = null, int? status = null);
        bool ToggleMaintenance(int roomId);
        IEnumerable<RoomRequestDTO> GetPendingRooms(string search = null);
        RoomRequestDTO GetPendingRoomById(int id);
        bool AcceptRoom(int id);
        bool RejectRoom(int id);
    }
}