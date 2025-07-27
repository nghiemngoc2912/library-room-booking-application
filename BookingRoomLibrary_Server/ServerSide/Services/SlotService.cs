using Microsoft.EntityFrameworkCore;
using ServerSide.DTOs;
using ServerSide.Models;
using ServerSide.Repositories;
using ServerSide.Constants;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ServerSide.Services
{
    public class SlotService : ISlotService
    {
        private readonly ISlotRepository slotRepository;

        public SlotService(ISlotRepository slotRepository)
        {
            this.slotRepository = slotRepository;
        }

        public IEnumerable<Slot> GetAll()
        {
            return slotRepository.GetAll().Where(s=>s.Status==(byte)SlotStatus.Active);
        }

        public Slot GetById(int id)
        {
            return slotRepository.GetById(id);
        }

        public SlotDTO GetSlotByIdForUpdate(int id)
        {
            var slot = slotRepository.GetById(id);
            return slot != null ? new SlotDTO(slot) : null;
        }

        public IEnumerable<SlotDTO> GetFilteredSlots(string search = null, int? status = null)
        {
            var slots = slotRepository.GetAll().AsQueryable();

            // Tìm theo Order nếu search là số nguyên
            if (!string.IsNullOrWhiteSpace(search) && int.TryParse(search, out int order))
            {
                slots = slots.Where(s => s.Order == order);
            }

            // Lọc theo status (nếu có)
            if (status.HasValue)
            {
                // Kiểm tra nếu status là một giá trị hợp lệ trong SlotStatus enum
                if (!Enum.IsDefined(typeof(SlotStatus), (byte)status.Value))
                {
                    throw new ArgumentException("Trạng thái không hợp lệ. Chỉ chấp nhận: Pending (0), Active (1), Inactive (3).");
                }

                byte statusByte = (byte)status.Value;
                slots = slots.Where(s => s.Status == statusByte);
            }

            return slots.Select(s => new SlotDTO(s)).ToList();
        }

        public bool CreateSlot(SlotDTO slotDTO)
        {
            if (slotDTO == null)
            {
                throw new ArgumentNullException("DTO không hợp lệ.");
            }

            if (slotDTO.Order <= 0)
            {
                throw new ArgumentException("Order phải lớn hơn 0.");
            }

            if (!TimeOnly.TryParse(slotDTO.FromTime, out TimeOnly fromTime) ||
                !TimeOnly.TryParse(slotDTO.ToTime, out TimeOnly toTime))
            {
                throw new ArgumentException("Thời gian không hợp lệ. Định dạng: HH:mm.");
            }

            if (fromTime >= toTime)
            {
                throw new ArgumentException("FromTime phải nhỏ hơn ToTime.");
            }

            // Check hợp lệ theo SlotStatus enum
            if (!Enum.IsDefined(typeof(SlotStatus), (byte)slotDTO.Status))
            {
                var validStatuses = string.Join(", ", Enum.GetValues(typeof(SlotStatus)).Cast<byte>());
                throw new ArgumentException($"Trạng thái không hợp lệ. Giá trị hợp lệ: {validStatuses}.");
            }

            var slot = new Slot
            {
                Order = slotDTO.Order,
                FromTime = fromTime,
                ToTime = toTime,
                Status = (byte)Constants.SlotStatus.Pending
            };

            return slotRepository.Create(slot);
        }


        public bool UpdateSlot(SlotDTO slotDTO)
        {
            if (slotDTO == null)
            {
                throw new ArgumentNullException("DTO không hợp lệ.");
            }

            if (slotDTO.Order <= 0)
            {
                throw new ArgumentException("Order phải lớn hơn 0.");
            }

            if (!TimeOnly.TryParse(slotDTO.FromTime, out TimeOnly fromTime) ||
                !TimeOnly.TryParse(slotDTO.ToTime, out TimeOnly toTime))
            {
                throw new ArgumentException("Thời gian không hợp lệ. Định dạng: HH:mm.");
            }

            if (fromTime >= toTime)
            {
                throw new ArgumentException("FromTime phải nhỏ hơn ToTime.");
            }

            // Kiểm tra trạng thái hợp lệ
            if (!Enum.IsDefined(typeof(SlotStatus), (byte)slotDTO.Status))
            {
                var validStatuses = string.Join(", ", Enum.GetValues(typeof(SlotStatus)).Cast<byte>());
                throw new ArgumentException($"Trạng thái không hợp lệ. Giá trị hợp lệ: {validStatuses}.");
            }

            var slot = slotRepository.GetById(slotDTO.Id);
            if (slot == null)
            {
                return false;
            }

            slot.Order = slotDTO.Order;
            slot.FromTime = fromTime;
            slot.ToTime = toTime;
            slot.Status = (byte)slotDTO.Status;

            return slotRepository.Update(slot);
        }


        public bool DeactivateSlot(int id)
        {
            var slot = slotRepository.GetById(id);
            if (slot == null || slot.Status != (byte)SlotStatus.Active) // only deactivate Active slots
            {
                return false;
            }

            slot.Status = (byte)SlotStatus.Inactive;
            return slotRepository.Update(slot);
        }

        public bool ActivateSlot(int id)
        {
            var slot = slotRepository.GetById(id);
            if (slot == null || slot.Status != (byte)SlotStatus.Inactive) // Only activate Inactive slots
            {
                return false;
            }

            slot.Status = (byte)SlotStatus.Active; 
            return slotRepository.Update(slot);
        }

        public IEnumerable<SlotRequestDTO> GetPendingSlots(string search = null)
        {
            var slots = slotRepository.GetAll().Where(s => s.Status == (byte)SlotStatus.Pending).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                slots = slots.Where(s => s.Order.ToString().Contains(search));
            }

            return slots.Select(s => new SlotRequestDTO(s)).ToList();
        }

        public SlotRequestDTO GetPendingSlotById(int id)
        {
            var slot = slotRepository.GetById(id);
            if (slot == null || slot.Status != (byte)SlotStatus.Pending)
            {
                return null;
            }
            return new SlotRequestDTO(slot);
        }

        public bool AcceptSlot(int id)
        {
            var slot = slotRepository.GetById(id);
            if (slot == null || slot.Status != (byte)SlotStatus.Pending)
            {
                return false;
            }
            slot.Status = (byte)SlotStatus.Active; 
            return slotRepository.Update(slot);
        }

        public bool RejectSlot(int id)
        {
            var slot = slotRepository.GetById(id);
            if (slot == null || slot.Status != (byte)SlotStatus.Pending)
            {
                return false;
            }
            return slotRepository.Delete(id);
        }

        public IEnumerable<SlotDTO> GetSlotsForMaintenance()
        {
            return slotRepository.GetAll()
                .Where(s => s.Status == (byte)SlotStatus.Active || s.Status == (byte)SlotStatus.OnlyForMaintain)
                .Select(s => new SlotDTO
                {
                    Id = s.Id,
                    FromTime = s.FromTime.ToString(@"hh\:mm"),
                    ToTime = s.ToTime.ToString(@"hh\:mm"),
                    Status = s.Status
                })
                .ToList();
        }
    }

    public interface ISlotService
    {
        IEnumerable<Slot> GetAll();
        Slot GetById(int id);
        SlotDTO GetSlotByIdForUpdate(int id);
        IEnumerable<SlotDTO> GetFilteredSlots(string search = null, int? status = null);
        bool CreateSlot(SlotDTO slotDTO);
        bool UpdateSlot(SlotDTO slotDTO);
        bool DeactivateSlot(int id);
        bool ActivateSlot(int id);
        IEnumerable<SlotRequestDTO> GetPendingSlots(string search = null);
        SlotRequestDTO GetPendingSlotById(int id);
        bool AcceptSlot(int id);
        bool RejectSlot(int id);
        IEnumerable<SlotDTO> GetSlotsForMaintenance();
    }
}